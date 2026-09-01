import { z } from "zod/v4";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";

const FormSchema = z.object({
  name: z.string().min(1),
});

type FormData = z.infer<typeof FormSchema>;

// 单向数据流示例：初始化 → 编辑 → 提交
export function SubmitHandlerExample({
  originalData,
  onSubmit,
}: {
  originalData: FormData;
  onSubmit: (data: FormData) => void;
}) {
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    // ✅ 深拷贝副本，originalData 在整个表单生命周期内不可变
    defaultValues: { ...originalData },
  });

  const handleSubmit = (data: FormData) => {
    // ✅ 将表单值副本传给外部 onSubmit，不直接传引用
    onSubmit({ ...data });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        {/* 表单字段... */}
      </form>
    </Form>
  );
}
