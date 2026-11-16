#!/usr/bin/env python3
"""按秒数汇总补录投入并向上取整；时间来源由调用方核对，不访问 Linear。"""

import argparse
import json


def nonnegative_seconds(value):
    try:
        seconds = int(value)
    except ValueError as error:
        raise argparse.ArgumentTypeError("时长必须是整数秒数") from error
    if seconds < 0:
        raise argparse.ArgumentTypeError("时长不能为负数")
    return seconds


def points(seconds):
    return (seconds + 3599) // 3600


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("seconds", nargs="+", type=nonnegative_seconds, help="每段未记录投入的秒数")
    parser.add_argument("--previous-seconds", type=nonnegative_seconds, default=0, help="前次已记录累计秒数，不能用原计划 estimate 反推；新建项为 0")
    args = parser.parse_args()
    added = sum(args.seconds)
    total = args.previous_seconds + added
    print(json.dumps({
        "previous_seconds": args.previous_seconds,
        "added_seconds": added,
        "total_seconds": total,
        "previous_points": points(args.previous_seconds),
        "target_points": points(total),
        "point_delta": points(total) - points(args.previous_seconds),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
