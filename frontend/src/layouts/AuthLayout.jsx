import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <NavLink to="/" className="flex items-center justify-center gap-2 group mb-6">
          <div className="bg-indigo-600 p-2 rounded-xl group-hover:bg-indigo-700 transition-colors">
            <BrainCircuit className="h-8 w-8 text-white" />
          </div>
          <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            SkillMatch AI
          </span>
        </NavLink>
      </div>

      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
