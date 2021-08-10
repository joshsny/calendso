import { XIcon } from "@heroicons/react/outline";
import Head from "next/head";
import router from "next/router";
import React from "react";
import prisma from "../../lib/prisma";

export default function Type(props) {
  // Just redirect to the schedule page to reschedule it.
  return (
    <div>
      <Head>
        <title>Reschedule | Calendso</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="max-w-3xl mx-auto my-24">
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 my-4 sm:my-0 transition-opacity" aria-hidden="true">
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
              </span>
              <div
                className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline">
                <div>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <XIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      {props.error}
                    </h3>
                  </div>
                </div>
                {props.booking && (
                  <div className="mt-5 sm:mt-6 text-center">
                    <div className="mt-5">
                      <button
                        onClick={() => router.push(`/${props.booking.user.username}`)}
                        type="button"
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:text-sm mx-2 btn-white">
                        Schedule another meeting
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  const booking = await prisma.booking.findFirst({
    where: {
      uid: context.query.uid,
    },
    select: {
      id: true,
      user: { select: { username: true } },
      eventType: { select: { slug: true } },
      title: true,
      description: true,
      startTime: true,
      endTime: true,
      attendees: true,
    },
  });

  if (!booking) {
    return {
      props: {
        error: "This booking was already cancelled and cannot be rescheduled.",
      },
    };
  }

  // Workaround since Next.js has problems serializing date objects (see https://github.com/vercel/next.js/issues/11993)
  const bookingObj = Object.assign({}, booking, {
    startTime: booking.startTime.toString(),
    endTime: booking.endTime.toString(),
  });

  if (!booking.eventType) {
    return {
      props: {
        error: "This booking cannot be rescheduled.",
        booking: bookingObj,
      },
    };
  }

  return {
    redirect: {
      destination:
        "/" + booking.user.username + "/" + booking.eventType.slug + "?rescheduleUid=" + context.query.uid,
      permanent: false,
    },
  };
}
