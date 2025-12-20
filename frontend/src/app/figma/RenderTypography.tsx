"use client";
import React from "react";
const RenderTypography = ({ fonts }) => {
  if (!fonts || Object.keys(fonts).length === 0) return null;
  return (
    <div className="bg-navy rounded-2xl shadow-xl p-2  mb-4 border border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
          <span>Aa</span>
        </div>
        <h5 className=" font-bold text-slate-800">Typography</h5>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(fonts).map(([key, fontObj]) => (
          <div
            key={key}
            className="group bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-bold text-slate-800">
                  {fontObj.family || key}
                </h4>
                <p className="text-xs text-slate-500 font-mono mt-1">{key}</p>
              </div>
              <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-sm font-bold text-slate-600">T</span>
              </div>
            </div>
            {fontObj.sizes && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-slate-600 mb-2">
                  Sizes
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.values(fontObj.sizes).map((size, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-navy rounded-md text-xs font-mono text-slate-700 border border-slate-200"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {fontObj.weights && (
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">
                  Weights
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.values(fontObj.weights).map((weight, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-navy rounded-md text-xs font-mono text-slate-700 border border-slate-200"
                    >
                      {weight}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
export default RenderTypography;
