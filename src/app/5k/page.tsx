'use client';

import React from 'react';
import { notFound } from 'next/navigation';
import LazySponsorSection from '@/components/LazySponsorSection';
import SponsorSignupForm from '@/components/SponsorSignupForm';

// Chase the Rainbow 5K happened on 2026-06-13. Set to true to show this page again next year.
const SHOW_5K: boolean = false;

export default function FiveKPage() {
  if (!SHOW_5K) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent mb-4 sm:mb-6">
            Chase the Rainbow 5K
          </h1>
          <p className="text-xl sm:text-2xl text-gray-800 mb-3 sm:mb-4">
            <strong>Stride with Pride</strong>
          </p>
          <p className="text-lg sm:text-xl text-gray-700 mb-6 sm:mb-8">
            Join Us for the Inaugural Katy Pride Fun Run!
          </p>
          <p className="text-base sm:text-lg text-gray-600 mb-3 sm:mb-4">
            <strong>Saturday, June 13, 2026</strong><br/>
            <strong>7:30 AM CDT</strong><br/>
            <strong>John Paul Landing Park</strong><br/>
            9150 Katy Hockley Rd, Cypress, TX 77433
          </p>
          <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 max-w-3xl mx-auto">
            Lace up and get ready to celebrate community, inclusion, and pride while helping raise funds and awareness for Katy Pride mission. Whether you run, walk, or cheer from the sidelines, this event is all about coming together and showing our colors with joy and unity.
          </p>
        </div>
          
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12">
          <a
            href="https://raceroster.com/events/2026/116853/chase-the-rainbow-stride-with-pride"
            target="_blank"
            rel="noopener noreferrer"
            className="font-heading inline-flex items-center justify-center rounded-full bg-[#760088] px-6 sm:px-8 py-3 sm:py-4 font-bold text-white text-base sm:text-lg shadow-lg transition-all hover:bg-[#5a0666] hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#760088] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <span>Register Now</span>
            <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 19H5V5h7V3H5c-1 0-2 1-2 2v14c0 1 1 2 2 2h14c1 0 2-1 2-2v-7h-2v7zM14 3v2h4l-10 10 1 1L19 6V10h2V3h-7z"/>
            </svg>
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-purple-100/20">
            <h2 className="font-heading text-3xl font-bold text-[#760088] mb-6">Event Details</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-[#760088] mr-3 mt-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1 0-2 1-2 2L3 19c0 1 1 2 2 2h14c1 0 2-1 2-2V5c0-1-1-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                </svg>
                <div>
                  <p className="font-semibold text-gray-800">Date & Time</p>
                  <p className="text-gray-600">Saturday, June 13, 2026</p>
                  <p className="text-gray-600">7:30 AM CDT (Race start)</p>
                  <p className="text-gray-600">7:30 AM - Packet pick-up begins</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <svg className="w-6 h-6 text-[#760088] mr-3 mt-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7zm0 10c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
                </svg>
                <div>
                  <p className="font-semibold text-gray-800">Location</p>
                  <p className="text-gray-600">John Paul Landing Park</p>
                  <p className="text-gray-600">9150 Katy Hockley Rd</p>
                  <p className="text-gray-600">Cypress, TX 77433</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <svg className="w-6 h-6 text-[#760088] mr-3 mt-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 11c2 0 3-1 3-3s-1-3-3-3c-2 0-3 1-3 3s1 3 3 3zm-8 0c2 0 3-1 3-3s-1-3-3-3C6 5 5 6 5 8s1 3 3 3zm0 2c-2 0-7 1-7 4V19h14v-2c0-3-5-4-7-4zm8 0c0 0-1 0-1 0 1 1 2 2 2 3V19h6v-2c0-3-5-4-7-4z"/>
                </svg>
                <div>
                  <p className="font-semibold text-gray-800">Event Details</p>
                  <p className="text-gray-600">Inaugural Katy Pride Fun Run</p>
                  <p className="text-gray-600">Run, walk, or cheer from sidelines</p>
                  <p className="text-gray-600">Celebrating community, inclusion and pride</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-purple-100/20">
            <h2 className="font-heading text-3xl font-bold text-[#760088] mb-6">Support the Cause</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                All proceeds from the Chase the Rainbow 5K benefit Katy Pride LGBTQ and our mission to create an inclusive community in Katy and West Houston.
              </p>
              <p className="text-gray-700">
                Your participation helps us:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Host community events throughout the year</li>
                <li>Provide educational programs and workshops</li>
                <li>Advocate for LGBTQ+ equality and inclusion</li>
                <li>Support local LGBTQ+ youth and families</li>
              </ul>
            </div>
          </div>
        </div>

        <LazySponsorSection className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-8 mb-12 border border-purple-100/20 border-t-4 [border-top:4px_solid_linear-gradient(90deg,#ff0080,#ff8c00,#ffd700,#00ff00,#00ffff,#0080ff,#8000ff)]">
          <h2 className="font-heading text-3xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent mb-6 text-center">
            Become a Sponsor
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="border-2 border-purple-100/50 rounded-xl p-6 hover:shadow-lg transition-shadow bg-[#EEEDFE]">
              <div className="mb-2">
                <h3 className="font-bold text-xl text-[#760088]">Water Station Sponsor</h3>
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-3">FREE</p>
              <p className="text-sm text-gray-500 mb-3">(14 available)</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>Name listed on event website</li>
                <li>Medium logo on race shirts</li>
                <li>Option for promotional items</li>
              </ul>
            </div>
            
            <div className="border-2 border-purple-100/50 rounded-xl p-6 hover:shadow-lg transition-shadow bg-[#EEEDFE]">
              <div className="mb-2">
                <h3 className="font-bold text-xl text-[#760088]">Community Sponsor</h3>
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-3">$100</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>Name listed on event website</li>
                <li>Recognition on event signage</li>
                <li>1 complimentary race entry</li>
                <li>Option for flyers/coupons in race bags</li>
              </ul>
            </div>
            
            <div className="border-2 border-purple-100/50 rounded-xl p-6 hover:shadow-lg transition-shadow bg-[#EEEDFE]">
              <div className="mb-2">
                <h3 className="font-bold text-xl text-[#760088]">Bronze Sponsor</h3>
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-3">$250</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>Small logo on race shirts</li>
                <li>Logo on social media</li>
                <li>2 complimentary race entries</li>
                <li>Option for promotional items in race bags</li>
              </ul>
            </div>
            
            <div className="border-2 border-purple-100/50 rounded-xl p-6 hover:shadow-lg transition-shadow bg-[#EEEDFE]">
              <div className="mb-2">
                <h3 className="font-bold text-xl text-[#CE9A5A]">Color Run Sponsor</h3>
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-3">$350</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>Name listed on event website</li>
                <li>Premium logo on race shirts</li>
                <li>Logo on social media mentions</li>
                <li>Option for promotional items in race bags</li>
              </ul>
            </div>
            
            <div className="border-2 border-purple-100/50 rounded-xl p-6 hover:shadow-lg transition-shadow bg-[#EEEDFE]">
              <div className="mb-2">
                <h3 className="font-bold text-xl text-[#888780]">Silver Sponsor</h3>
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-3">$500</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>Medium logo on race shirts</li>
                <li>Option for promotional items in race bags</li>
                <li>Option for festival area placement</li>
                <li>4 complimentary race entries</li>
              </ul>
            </div>
            
            <div className="border-2 border-purple-100/50 rounded-xl p-6 hover:shadow-lg transition-shadow bg-[#EEEDFE]">
              <div className="mb-2">
                <h3 className="font-bold text-xl text-[#06bd01]">Kids Dash Sponsor</h3>
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-3">$1,000</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>Name listed on event website and signage</li>
                <li>Large logo on race shirts</li>
                <li>Logo on social media mentions</li>
                <li>Booth placement at Kids Dash area</li>
              </ul>
            </div>
            
            <div className="border-2 border-purple-100/50 rounded-xl p-6 hover:shadow-lg transition-shadow bg-[#EEEDFE]">
              <div className="mb-2">
                <h3 className="font-bold text-xl text-[#BA7517]">Gold Sponsor</h3>
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-3">$1,000</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>Prominent logo on race shirts and signage</li>
                <li>Logo on event website and social media</li>
                <li>6 complimentary race entries</li>
                <li>Booth space in festival area</li>
                <li>Option for promotional items in race bags</li>
              </ul>
            </div>
            
            <div className="border-2 border-purple-100/50 rounded-xl p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-indigo-50 border-t-4 [border-top:4px_solid_linear-gradient(90deg,#ff0080,#ff8c00,#ffd700,#00ff00,#00ffff,#0080ff,#8000ff)]">
              <div className="mb-2">
                <h3 className="font-bold text-xl text-[#760088]">Presenting Sponsor</h3>
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-3">$2,500</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>Presented by on event materials</li>
                <li>Largest logo on race shirts</li>
                <li>Recognition in press releases</li>
                <li>10 complimentary race entries</li>
                <li>Premium booth space in festival area</li>
                <li>Option for promotional items in race bags</li>
              </ul>
            </div>
          </div>
          
          <SponsorSignupForm />
        </LazySponsorSection>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-8 mb-12 border border-purple-100/20">
          <h2 className="font-heading text-3xl font-bold text-gray-800 mb-6 text-center">Race Day Information</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#760088]/10 rounded-full mb-4">
                <svg className="w-6 h-6 text-[#760088]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1 0-2 1-2 2L3 19c0 1 1 2 2 2h14c1 0 2-1 2-2V5c0-1-1-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                </svg>
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Event Schedule</h3>
              <p className="text-gray-600">7:30 AM - Race Day Packet Pick-up Begins</p>
              <p className="text-gray-600">8:00 AM - Opening Ceremony</p>
              <p className="text-gray-600">8:10 AM - Kids Dash starts</p>
              <p className="text-gray-600">8:30 AM - 5K Begins (immediately after Kids Dash)</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#06bd01]/10 rounded-full mb-4">
                <svg className="w-6 h-6 text-[#06bd01]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Race Perks</h3>
              <p className="text-gray-600">Official event T-shirt</p>
              <p className="text-gray-600">Special sponsor surprises</p>
              <p className="text-gray-600">Prizes for select finishers</p>
              <p className="text-gray-600">Best Dressed contest</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#760088]/10 rounded-full mb-4">
                <svg className="w-6 h-6 text-[#760088]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                </svg>
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Race Rules</h3>
              <p className="text-gray-600">Strollers welcome</p>
              <p className="text-gray-600">Leashed pets welcome</p>
              <p className="text-gray-600">No bicycles permitted</p>
              <p className="text-gray-600">No electric scooters</p>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-purple-100/20">
          <h2 className="font-heading text-3xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent mb-6 text-center">
            Registration Information
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="border-2 border-purple-100/50 rounded-xl p-6 text-center">
              <h3 className="font-bold text-xl text-[#760088] mb-2">Kids Dash</h3>
              <p className="text-sm text-gray-600 mb-3">Ages up to 12 years</p>
              <div className="space-y-2">
                <p className="text-lg font-bold text-gray-800">Early Bird: $28.99</p>
                <p className="text-sm text-gray-500">(March 16 - April 30)</p>
                <p className="text-lg font-bold text-gray-800">Standard: $39.74</p>
                <p className="text-sm text-gray-500">(May 1 - June 11)</p>
              </div>
            </div>
            
            <div className="border-2 border-purple-100/50 rounded-xl p-6 text-center">
              <h3 className="font-bold text-xl text-[#760088] mb-2">5K Run</h3>
              <p className="text-sm text-gray-600 mb-3">All ages welcome</p>
              <div className="space-y-2">
                <p className="text-lg font-bold text-gray-800">Early Bird: $39.74</p>
                <p className="text-sm text-gray-500">(March 16 - April 30)</p>
                <p className="text-lg font-bold text-gray-800">Standard: $50.48</p>
                <p className="text-sm text-gray-500">(May 1 - June 11)</p>
              </div>
            </div>
            
            <div className="border-2 border-purple-100/50 rounded-xl p-6 text-center">
              <h3 className="font-bold text-xl text-[#760088] mb-2">Virtual 5K</h3>
              <p className="text-sm text-gray-600 mb-3">Run anywhere!</p>
              <div className="space-y-2">
                <p className="text-lg font-bold text-gray-800">Standard: $45.11</p>
                <p className="text-sm text-gray-500">(March 16 - June 12)</p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              All prices inclusive of mandatory charges, taxes, and fees.
            </p>
            <a
              href="https://raceroster.com/events/2026/116853/chase-the-rainbow-stride-with-pride"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-[#760088] px-8 py-4 font-bold text-white text-lg shadow-lg transition-all hover:bg-[#5a0666] hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#760088] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <span>Register Now on Race Roster</span>
              <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 19H5V5h7V3H5c-1 0-2 1-2 2v14c0 1 1 2 2 2h14c1 0 2-1 2-2v-7h-2v7zM14 3v2h4l-10 10 1 1L19 6V10h2V3h-7z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
