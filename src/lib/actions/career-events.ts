"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import type { CareerEventType } from "@/generated/prisma/enums";

function str(value: FormDataEntryValue | null): string | null {
  if (value == null) return null;
  const s = value.toString().trim();
  return s.length ? s : null;
}

export async function addCareerEvent(formData: FormData) {
  const session = await requireSession();

  const eventDateRaw = str(formData.get("eventDate"));

  await prisma.careerEvent.create({
    data: {
      userId: session.user.id,
      type: (str(formData.get("type")) as CareerEventType) ?? "NOTE",
      title: str(formData.get("title")) ?? "Untitled event",
      description: str(formData.get("description")),
      eventDate: eventDateRaw ? new Date(eventDateRaw) : new Date(),
    },
  });

  revalidatePath("/career-memory");
  revalidatePath("/dashboard");
}

export async function deleteCareerEvent(eventId: string) {
  const session = await requireSession();
  await prisma.careerEvent.deleteMany({ where: { id: eventId, userId: session.user.id } });
  revalidatePath("/career-memory");
}
