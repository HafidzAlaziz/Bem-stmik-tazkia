"use client";

import React from "react";

export default function RootLoading() {
  return (
    <div className="w-full min-h-screen bg-background pt-24 pb-20 px-4 md:px-10">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Header Skeleton */}
        <div className="flex flex-col items-center text-center gap-4 animate-pulse pt-10">
          <div className="w-3/4 md:w-1/2 h-10 md:h-14 bg-surface-variant/60 rounded-2xl" />
          <div className="w-1/2 md:w-1/3 h-4 md:h-5 bg-surface-variant/40 rounded-xl" />
        </div>

        {/* Content Skeleton (Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-surface border border-outline-variant/30 rounded-3xl p-5 h-[320px] flex flex-col justify-between animate-pulse">
              <div className="w-full h-44 bg-surface-variant/60 rounded-2xl" />
              <div className="flex flex-col gap-3 mt-4">
                <div className="h-6 bg-surface-variant/70 rounded-md w-3/4" />
                <div className="h-4 bg-surface-variant/40 rounded-md w-1/2" />
                <div className="h-4 bg-surface-variant/40 rounded-md w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
