'use client'

import { useState } from 'react'
import { Button } from './button'
import { Card, CardContent } from './card'
import { Info, X } from 'lucide-react'

export function StepsGuide() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center gap-1 text-gray-500 hover:text-blue-600"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Info className="w-4 h-4" />
        <span className="hidden sm:inline">How steps work</span>
      </Button>

      {isOpen && (
        <Card className="fixed sm:absolute top-[50%] left-[50%] sm:top-full sm:left-auto sm:right-0 transform -translate-x-1/2 -translate-y-1/2 sm:translate-x-0 sm:translate-y-0 sm:mt-2 w-[90vw] max-w-sm sm:w-96 z-50 shadow-lg border-blue-100">
          <div className="absolute top-2 right-2">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardContent className="pt-4 pb-5">
            <h3 className="font-medium text-base mb-3">How Steps Work</h3>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="flex gap-2 items-start">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">1</div>
                <div>
                  <p className="font-medium text-sm">Job Description Analysis</p>
                  <p className="text-xs text-gray-600">Upload or paste a job description to extract requirements</p>
                </div>
              </div>
              
              <div className="flex gap-2 items-start">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">2</div>
                <div>
                  <p className="font-medium text-sm">Resume Optimization</p>
                  <p className="text-xs text-gray-600">Tailor your resume to match the job requirements</p>
                </div>
              </div>
              
              <div className="flex gap-2 items-start">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">3</div>
                <div>
                  <p className="font-medium text-sm">Cover Letter</p>
                  <p className="text-xs text-gray-600">Create a personalized cover letter</p>
                </div>
              </div>
              
              <div className="flex gap-2 items-start">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">4</div>
                <div>
                  <p className="font-medium text-sm">Interview Prep</p>
                  <p className="text-xs text-gray-600">Get AI-generated interview questions</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-700 mb-2">Key:</p>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 text-green-600 rounded-full w-5 h-5 flex items-center justify-center">✓</div>
                  <span className="text-xs">Completed step</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center">•</div>
                  <span className="text-xs">Current step</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-gray-100 text-gray-400 rounded-full w-5 h-5 flex items-center justify-center opacity-60">•</div>
                  <span className="text-xs">Locked step (complete previous steps first)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
