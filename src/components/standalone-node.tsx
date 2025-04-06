"use client";

import React from "react";

interface StandaloneNodeProps {
  label: string;
  answer: string;
  children?: React.ReactNode;
}

export function StandaloneNode({ label, answer, children }: StandaloneNodeProps) {
  return (
    <div className="max-w-[600px] min-w-[400px] rounded-lg border border-gray-200 bg-white p-4 shadow-lg mx-auto">
      <div className="flex flex-col gap-4">
        <div className="rounded-md bg-blue-50 p-3">
          <p className="text-black-700 mb-1 text-lg font-bold capitalize">
            {label}
          </p>
        </div>

        <div className="rounded-md bg-gray-50 p-3">
          <p className="whitespace-pre-wrap text-gray-800">{answer}</p>
        </div>
        
        {children}
      </div>
    </div>
  );
}
