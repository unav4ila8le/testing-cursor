"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import * as Form from "@radix-ui/react-form";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/supabase";

type Todo = Tables["todos"]["Row"];

const todoSchema = z.object({
  text: z.string().min(1, "Todo cannot be empty").max(100, "Todo is too long"),
});

type TodoFormData = z.infer<typeof todoSchema>;

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const { data, error } = await supabase
          .from("todos")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTodos(data || []);
      } catch (error) {
        console.error("Error fetching todos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodos();

    // Set up real-time subscription
    const subscription = supabase
      .channel("todos")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "todos" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTodos((current) => [payload.new as Todo, ...current]);
          } else if (payload.eventType === "DELETE") {
            setTodos((current) =>
              current.filter((todo) => todo.id !== payload.old.id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const { error } = await supabase
        .from("todos")
        .insert([{ text: data.text.trim() }]);

      if (error) throw error;
      reset();
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  });

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase.from("todos").delete().eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  if (isLoading) {
    return (
      <main className="mx-auto min-h-screen max-w-2xl p-4 md:p-8">
        <h1 className="mb-8 text-2xl font-semibold">Loading...</h1>
      </main>
    );
  }

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
