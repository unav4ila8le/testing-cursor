"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import * as Form from "@radix-ui/react-form";

type Todo = {
  id: string;
  text: string;
};

const todoSchema = z.object({
  text: z.string().min(1, "Todo cannot be empty").max(100, "Todo is too long"),
});

type TodoFormData = z.infer<typeof todoSchema>;

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TodoFormData>({
    resolver: zodResolver(todoSchema),
  });

  const todoText = watch("text");

  const onSubmit = handleSubmit(async (data) => {
    setTodos([...todos, { id: crypto.randomUUID(), text: data.text.trim() }]);
    reset();
  });

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <main className="mx-auto min-h-screen max-w-2xl p-4 md:p-8">
      <h1 className="mb-8 text-2xl font-semibold">Minimal Todo List</h1>

      <Form.Root className="mb-8" onSubmit={onSubmit}>
        <div className="flex gap-2">
          <Form.Field className="flex-1" name="text">
            <div className="relative">
              <Form.Control asChild>
                <input
                  {...register("text")}
                  placeholder="Add a new todo..."
                  className="h-9 w-full rounded-md border px-3 focus:outline-none focus:ring-1 focus:ring-neutral-950 disabled:opacity-50"
                  disabled={isSubmitting}
                />
              </Form.Control>
              {errors.text && (
                <Form.Message className="absolute -bottom-6 left-0 text-sm text-red-500">
                  {errors.text.message}
                </Form.Message>
              )}
            </div>
          </Form.Field>
          <Button type="submit" disabled={isSubmitting || !todoText}>
            Add
          </Button>
        </div>
      </Form.Root>

      <ul className="space-y-2">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center justify-between rounded-md border bg-white p-3"
          >
            <span>{todo.text}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteTodo(todo.id)}
              className="text-red-500 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </main>
  );
}
