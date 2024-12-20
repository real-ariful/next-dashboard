import { lusitana } from '@/app/ui/fonts';
import { useState } from 'react';

export default async function Sample() {
  return (
    <div className="w-full">
      <h1 className={`${lusitana.className} mb-8 text-xl md:text-2xl`}>
        Sample Page
      </h1>
      <div className="mt-6 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
