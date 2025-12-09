'use client'

import React from 'react'

interface KeyFeaturesProps {
  dictionary: any
}

export default function KeyFeaturesI18n({ dictionary }: KeyFeaturesProps) {
  const features = dictionary.keyFeatures

  return (
    <section className="space-y-20">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold tracking-tighter">{features.title}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {/* 第一行 */}
        <div className="space-y-4 text-left">
          <div className="w-12 h-12" style={{ color: '#20A884' }}>
            <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M5,20H19V18H5V20M19,9H15V3H9V9H5L12,16L19,9M12,13L10,11H11V5H13V11H14L12,13Z"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold">{features.freeNoInstall.title}</h3>
          <p className="text-gray-600">{features.freeNoInstall.description}</p>
        </div>

        <div className="space-y-4 text-left">
          <div className="w-12 h-12" style={{ color: '#20A884' }}>
            <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M18,8H17V6C17,3.24 14.76,1 12,1S7,3.24 7,6V8H6A2,2 0 0,0 4,10V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V10A2,2 0 0,0 18,8M12,3C13.66,3 15,4.34 15,6V8H9V6C9,4.34 10.34,3 12,3M18,20H6V10H18V20M12,17A3,3 0 0,0 15,14A3,3 0 0,0 12,11A3,3 0 0,0 9,14A3,3 0 0,0 12,17M12,13A1,1 0 0,1 13,14A1,1 0 0,1 12,15A1,1 0 0,1 11,14A1,1 0 0,1 12,13Z"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold">{features.privateSecure.title}</h3>
          <p className="text-gray-600">{features.privateSecure.description}</p>
        </div>

        <div className="space-y-4 text-left">
          <div className="w-12 h-12" style={{ color: '#20A884' }}>
            <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M8,12H16V14H8V12M8,16H13V18H8V16Z"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold">{features.universalFormat.title}</h3>
          <p className="text-gray-600">{features.universalFormat.description}</p>
        </div>

        {/* 第二行 */}
        <div className="space-y-4 text-left md:mt-16">
          <div className="w-12 h-12" style={{ color: '#20A884' }}>
            <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M5,4V6H7V8H5V10H7V12H5V14H7V16H5V18H7V20H5V22H7V20H9V22H11V20H13V22H15V20H17V22H19V20H17V18H19V16H17V14H19V12H17V10H19V8H17V6H19V4H17V6H15V4H13V6H11V4H9V6H7V4H5M7,8H9V10H7V8M11,8H13V10H11V8M15,8H17V10H15V8M7,12H9V14H7V12M11,12H13V14H11V12M15,12H17V14H15V12M7,16H9V18H7V16M11,16H13V18H11V16M15,16H17V18H15V16Z"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold">{features.syncScrolling.title}</h3>
          <p className="text-gray-600">{features.syncScrolling.description}</p>
        </div>

        <div className="space-y-4 text-left md:mt-16">
          <div className="w-12 h-12" style={{ color: '#20A884' }}>
            <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.62,12L12,5.67L14.37,12M11,3L5.5,17H7.75L8.87,14H15.12L16.25,17H18.5L13,3H11M15,18L16.09,19.5L14.5,20.82L15.91,22L17.5,20.69L19.09,22L20.5,20.82L18.91,19.5L20,18L18.91,16.5L20.5,15.18L19.09,14L17.5,15.31L15.91,14L14.5,15.18L16.09,16.5L15,18Z"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold">{features.instantHighlight.title}</h3>
          <p className="text-gray-600">{features.instantHighlight.description}</p>
        </div>

        <div className="space-y-4 text-left md:mt-16">
          <div className="w-12 h-12" style={{ color: '#20A884' }}>
            <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M11,15H6L13,1V9H18L11,23V15M11,13H8L11,7V13M13,13V7L16,13H13Z"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold">{features.highPerformance.title}</h3>
          <p className="text-gray-600">{features.highPerformance.description}</p>
        </div>
      </div>
    </section>
  )
}