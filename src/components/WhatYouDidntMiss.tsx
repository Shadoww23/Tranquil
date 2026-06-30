"use client";

import { whatYouDidntMiss } from "@/lib/data";

export default function WhatYouDidntMiss() {
  return (
    <div className="rounded-2xl bg-white border border-stone-100 shadow-sm p-5">
      <div className="mb-4">
        <h2 className="font-semibold text-stone-800">What You Didn&apos;t Miss</h2>
        <p className="text-xs text-stone-400 mt-0.5">
          A calm summary of the noise while you were offline.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {whatYouDidntMiss.map((item) => (
          <div
            key={item.platform}
            className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100"
          >
            <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-500">
              {item.platform[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-stone-700">{item.platform}</p>
              <p className="text-xs text-stone-400 mt-0.5">{item.summary}</p>
              <div className="flex gap-2 mt-1.5">
                <span className="text-xs bg-stone-200 text-stone-500 px-2 py-0.5 rounded-full">
                  {item.posts.toLocaleString()} posts
                </span>
                {item.stories && (
                  <span className="text-xs bg-stone-200 text-stone-500 px-2 py-0.5 rounded-full">
                    {item.stories} stories
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-center text-stone-300 mt-4">
        You stayed calm. The internet kept spinning.
      </p>
    </div>
  );
}
