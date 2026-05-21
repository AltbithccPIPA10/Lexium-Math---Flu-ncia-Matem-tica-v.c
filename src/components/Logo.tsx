/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AudioLines, Brain } from "lucide-react";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export function Logo({ className = "", iconOnly = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-100 dark:shadow-none">
        <AudioLines className="w-5 h-5 absolute animate-pulse opacity-80 text-indigo-100" />
        <Brain className="w-5 h-5" />
      </div>
      {!iconOnly && (
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-slate-800 flex items-center">
            LExium<span className="text-indigo-600 font-extrabold ml-0.5">Math</span>
          </span>
          <span className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase leading-none">
            Inteligência Auditiva
          </span>
        </div>
      )}
    </div>
  );
}
