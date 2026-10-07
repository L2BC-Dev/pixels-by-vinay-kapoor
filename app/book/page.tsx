import type { Metadata } from "next";
import { Suspense } from "react";
import BookingForm from "@/components/book/BookingForm";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Check Dates & Book",
  description: "Check live availability and reserve your wedding dates with Pixels by Vinay Kapoor.",
};

export default function Book() {
  return (
    <>
      <PageHeader eyebrow="Reservations · तारीख़" title={<>Lock the <em className="text-gradient">muhurat.</em></>} hi="मुहूर्त">
        Live availability for our crew. Pick your dates, tell us a little about your wedding, and we&apos;ll call you within a day.
      </PageHeader>
      <section className="px-5 pb-32 md:px-10">
        <div className="mx-auto max-w-[1400px]">
          <Suspense>
            <BookingForm />
          </Suspense>
        </div>
      </section>
    </>
  );
}
