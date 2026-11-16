#!/usr/bin/env python3
"""Synthesize narration clips for a video script with edge-tts (synthetic voice, online, no credentials).

Usage (from a task-local virtualenv that has edge-tts installed; never install globally):
  python narrate.py <script.json> --out <media-dir> [--voice zh-CN-XiaoxiaoNeural|en-US-AvaNeural] [--rate=+0%] [--attempts 2]

script.json comes from `create-video.mjs ... --script-out`. Writes <id>.mp3 per clip plus manifest.json with the
provider, voice, rate, text, sentence cues and byte sizes. Durations are measured afterwards by create-video.mjs
from the actual MP3 frames. The voice is synthetic and must be labeled as such wherever it is used.
"""
import argparse
import asyncio
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

# Natural female defaults with warm, conversational delivery (provider tags: Xiaoxiao "Warm", Ava "Caring, Pleasant").
# Normal rate: calm comes from the writing and the scene breathing room, not from slowing the voice down.
DEFAULT_VOICES = {'zh': 'zh-CN-XiaoxiaoNeural', 'en': 'en-US-AvaNeural'}


async def synth(edge_tts, text, voice, rate, path):
    comm = edge_tts.Communicate(text, voice, rate=rate, boundary='SentenceBoundary')
    cues, audio = [], bytearray()
    async for chunk in comm.stream():
        if chunk['type'] == 'audio':
            audio.extend(chunk['data'])
        elif chunk['type'] in ('SentenceBoundary', 'WordBoundary'):
            # offsets are in 100-ns units
            cues.append({'at': chunk['offset'] / 1e7, 'dur': chunk['duration'] / 1e7, 'text': chunk['text']})
    if not audio:
        raise RuntimeError('provider returned no audio')
    path.write_bytes(bytes(audio))
    return cues


async def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('script')
    ap.add_argument('--out', required=True)
    ap.add_argument('--voice')
    ap.add_argument('--rate', default='+0%')
    ap.add_argument('--attempts', type=int, default=2, help='per clip; the run stops after 3 failed clips')
    args = ap.parse_args()
    try:
        import edge_tts
    except ImportError:
        sys.exit('edge-tts is not installed in this Python; create a task-local venv and pip install edge-tts')
    script = json.loads(Path(args.script).read_text())
    voice = args.voice or DEFAULT_VOICES[script['lang']]
    voices = {v['ShortName']: v for v in await edge_tts.list_voices()}
    if voice not in voices:
        sys.exit(f'voice {voice} is not offered by the provider right now')
    info = voices[voice]
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    clips, failures = [], 0
    for clip in script['clips']:
        path = out / f"{clip['id']}.mp3"
        for attempt in range(1, args.attempts + 1):
            try:
                cues = await synth(edge_tts, clip['text'], voice, args.rate, path)
                break
            except Exception as exc:  # network or provider error: bounded retry, then stop
                print(f"{clip['id']}: attempt {attempt} failed: {exc}", file=sys.stderr)
                if attempt == args.attempts:
                    failures += 1
                    if failures >= 3:
                        sys.exit('stopping: provider failed for 3 clips')
                    cues = None
                else:
                    await asyncio.sleep(2)
        if cues is None:
            continue
        clips.append({'id': clip['id'], 'scene': clip['scene'], 'text': clip['text'], 'file': path.name,
                      'bytes': path.stat().st_size, 'cues': cues})
        print(f"{clip['id']}: {path.stat().st_size} bytes, {len(cues)} cues")
    manifest = {
        'synthetic': True,
        'note': 'Synthetic text-to-speech voice, not a human recording.',
        'provider': f'edge-tts {getattr(edge_tts, "__version__", "?")} (Microsoft Edge online Read Aloud TTS)',
        'voice': voice, 'gender': info.get('Gender'), 'locale': info.get('Locale'),
        'rate': args.rate, 'lang': script['lang'], 'format': 'audio-24khz-48kbitrate-mono-mp3',
        'generatedAt': datetime.now(timezone.utc).isoformat(timespec='seconds'),
        'clips': clips, 'missing': [c['id'] for c in script['clips'] if c['id'] not in {k['id'] for k in clips}],
    }
    (out / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
    if manifest['missing']:
        sys.exit(f"missing clips: {manifest['missing']}")


if __name__ == '__main__':
    asyncio.run(main())
