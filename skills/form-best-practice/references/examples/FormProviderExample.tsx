import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const FormSchema = z.object({
  title: z.string().min(1),
  tags: z.array(z.string()),
});

type FormData = z.infer<typeof FormSchema>;

// ✅ 父组件: 使用 FormProvider 将上下文传递给子组件
export function ComplexForm({
  onSubmit,
}: {
  onSubmit: (data: FormData) => void;
}) {
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: { title: "", tags: [] },
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        {/* 子组件通过 useFormContext 访问，不需要 props 传递 control */}
        <TagsInput />
      </form>
    </FormProvider>
  );
}

// ✅ 子组件：通过 useFormContext 访问表单上下文
function TagsInput() {
  const { control } = useFormContext<FormData>();

  return (
    <FormField
      control={control}
      name="tags"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tags</FormLabel>
          <FormControl>
            {/* 自定义标签输入组件 */}
            <Input
              placeholder="Press Enter to add tag"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const value = e.currentTarget.value.trim();
                  if (value) {
                    field.onChange([...field.value, value]);
                    e.currentTarget.value = "";
                  }
                }
              }}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
