"use server";

import { revalidatePath } from "next/cache";
import {
  approveModelCheckedCandidate,
  type QuestionApprovalInput,
  type QuestionApprovalResult,
} from "@/lib/quality";

export async function approveQuestionCandidate(
  input: QuestionApprovalInput,
): Promise<QuestionApprovalResult> {
  const result = await approveModelCheckedCandidate(input);
  if (result.ok) {
    revalidatePath("/quality");
    revalidatePath("/drill");
    revalidatePath("/timed");
    revalidatePath("/mastery");
  }
  return result;
}
