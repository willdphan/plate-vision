"use client";
import React, { useEffect, useRef } from "react";
import "app/globals.css";
import { useState } from "react";
import { startScript, stopScript, uploadVideo } from "@/app/api";

/* @client */
export default function PlateVision() {
  const [active, setActive] = useState<number | null>(null); // changed this to number | null
  const [cameraActive, setCameraActive] = useState(false); // New state variable

  const [questions, setQuestions] = useState([
    {
      question: "How long does it take?",
      answer:
        "It takes a while for the uploaded video file to be processed. So would recommend starting of with a short video a couple seconds long.",
    },
    {
      question: "What is Upload File?",
      answer:
        "Upload any video file for the computer vision model to analyze license plates. The longer the video, the longer it takes to process. Recommend videos a couple seconds.",
    },
    {
      question: "What is Use Camera?",
      answer:
        "Try the model in real-time with your current camera. Keep in mind, the plates are being captured then rendered on the frontend, so the video will be slow.",
    },
    {
      question: "Why use a Sample File?",
      answer: "If you don't have a sample file to use, we got you.",
    },
  ]);

  const toggleAccordion = (id: number) => {
    // added type annotation here
    if (active === id) {
      setActive(null);
    } else {
      setActive(id);
    }
  };

  useEffect(() => {
    const imgElement = document.getElementById(
      "realtime-video"
    ) as HTMLImageElement;
    let timeoutId: NodeJS.Timeout;

    async function fetchImage() {
      const response = await fetch("http://127.0.0.1:5000/video");
      const blob = await response.blob();
      if (imgElement) {
        imgElement.src = URL.createObjectURL(blob);
      }

      timeoutId = setTimeout(fetchImage, 100); // fetch every 100ms
    }

    fetchImage(); // Start the loop

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId); // Clean up timeout
      }
    };
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await uploadVideo(file);
        console.log("Upload successful");
      } catch (error) {
        console.log("Error uploading file:", error);
      }
    }
  };

  const handleStartClick = async () => {
    await startScript();
    setCameraActive(true); // Set camera to active when Start is clicked
  };

  const handleStopClick = async () => {
    await stopScript();
    setCameraActive(false); // Set camera to inactive when Stop is clicked
  };

  return (
    <div className="flex flex-col items-center justify-center h-full  bg-[#F7F8F9]">
      <div className="flex flex-row items-center justify-center space-x-20 h-[100vh]">
        <div className="flex flex-col justify-center h-3/4 w-2/5 border-[1px] border-gray-300 p-10 rounded-lg bg-white drop-shadow-xl	">
          <div className="text-black pb-8 text-lg font-semibold">
            Upload File
          </div>
          <label
            htmlFor="dropzone-file"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer   hover:bg-gray-100 dark:border-gray-400  "
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                SVG, PNG, JPG or GIF (MAX. 800x400px)
              </p>
            </div>
            <input
              ref={fileInputRef}
              id="dropzone-file"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          <div className="text-gray-500 py-5 my-10 border-[1px] flex items-center justify-between px-5 rounded-lg bg-gray-200">
            <div className="w-8/12 text-sm space-y-2">
              <div className="flex space-x-1">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                  >
                    <path
                      d="M15 4V8H19V20H5V4H15ZM3.9985 2C3.44749 2 3 2.44405 3 2.9918V21.0082C3 21.5447 3.44476 22 3.9934 22H20.0066C20.5551 22 21 21.5489 21 20.9925L20.9997 7L16 2H3.9985ZM15.0008 11.667L10.1219 8.41435C10.0562 8.37054 9.979 8.34717 9.9 8.34717C9.6791 8.34717 9.5 8.52625 9.5 8.74717V15.2524C9.5 15.3314 9.5234 15.4086 9.5672 15.4743C9.6897 15.6581 9.9381 15.7078 10.1219 15.5852L15.0008 12.3326C15.0447 12.3033 15.0824 12.2656 15.1117 12.2217C15.2343 12.0379 15.1846 11.7895 15.0008 11.667Z"
                      fill="rgba(64,64,64,1)"
                    ></path>
                  </svg>
                </div>
                <div>Sample File</div>
              </div>
              <div>
                You can download the attached example and use them as a starting
                point for your own file.
              </div>
            </div>
            <a
              href="public/sample.mp4"
              download
              className="bg-white p-3 rounded-lg border-[1px] border-gray-300 font-semibold"
            >
              Download
            </a>
          </div>
          <div className="flex items-center justify-between ">
            <div className="flex space-x-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                className="mt-[0.25em]"
              >
                <path
                  d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 15H13V17H11V15ZM13 13.3551V14H11V12.5C11 11.9477 11.4477 11.5 12 11.5C12.8284 11.5 13.5 10.8284 13.5 10C13.5 9.17157 12.8284 8.5 12 8.5C11.2723 8.5 10.6656 9.01823 10.5288 9.70577L8.56731 9.31346C8.88637 7.70919 10.302 6.5 12 6.5C13.933 6.5 15.5 8.067 15.5 10C15.5 11.5855 14.4457 12.9248 13 13.3551Z"
                  fill="rgba(138,144,153,1)"
                ></path>
              </svg>
              <button className="text-gray-500  rounded-lg   ">
                Help Center
              </button>
            </div>
            <button
              onClick={handleUploadClick}
              className="text-white bg-blue-600 rounded-lg p-2 w-1/4 "
            >
              Upload
            </button>
          </div>
        </div>

        {/* REAL TIME VIDEO */}

        <div className="flex flex-col justify-center h-3/4 w-2/5 border-[1px] border-gray-300 p-10 rounded-lg bg-white drop-shadow-xl	">
          <div className="text-black pb-8 text-lg font-semibold">
            Use Camera
          </div>

          <div className="video-container">
            <img
              id="realtime-video"
              src="http://127.0.0.1:5000/video"
              alt="Real-time Video"
              width="100"
              height="100"
              className={`w-full h-[25em] rounded-xl object-cover ${
                cameraActive ? "block" : "hidden"
              }`}
            />

            <video
              autoPlay
              loop
              muted
              playsInline
              className={`w-full h-[25em] rounded-xl object-cover ${
                cameraActive ? "hidden" : "block"
              }`}
            >
              <source src="/display.mov" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="flex items-center justify-between pt-10">
            <div className="flex items-center justify-between ">
              <div className="flex space-x-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  className="mt-[0.25em]"
                >
                  <path
                    d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 15H13V17H11V15ZM13 13.3551V14H11V12.5C11 11.9477 11.4477 11.5 12 11.5C12.8284 11.5 13.5 10.8284 13.5 10C13.5 9.17157 12.8284 8.5 12 8.5C11.2723 8.5 10.6656 9.01823 10.5288 9.70577L8.56731 9.31346C8.88637 7.70919 10.302 6.5 12 6.5C13.933 6.5 15.5 8.067 15.5 10C15.5 11.5855 14.4457 12.9248 13 13.3551Z"
                    fill="rgba(138,144,153,1)"
                  ></path>
                </svg>
                <button className="text-gray-500  rounded-lg   ">
                  Help Center
                </button>
              </div>
            </div>
            <div className="space-x-2 w-1/2 flex justify-end">
              <button
                onClick={handleStartClick}
                className="text-white bg-blue-600 rounded-lg p-2 w-6/12"
              >
                Start
              </button>
              <button
                onClick={handleStopClick}
                className="text-white bg-red-600 rounded-lg p-2 w-6/12"
              >
                Stop
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="text-black w-full flex flex-col items-center justify-center  h-[100vh]">
        <div className="w-full px-4   sm:px-6 lg:px-8 lg:py-14 mx-auto ">
          <div className="max-w-2xl mx-auto text-center mb-10 lg:mb-14">
            <h2 className="text-2xl font-bold md:text-4xl md:leading-tight text-black">
              Your questions, answered
            </h2>
            <p className="mt-1 text-black">
              Questions about the use of Plate Vision
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="hs-accordion-group">
              {questions.map((item, index) => (
                <div
                  className={`hs-accordion rounded-xl p-6 ${
                    active === index ? "bg-gray-100" : ""
                  }`}
                  id={`hs-accordion-${index}`}
                  key={index}
                >
                  <button
                    className="hs-accordion-toggle group pb-3 inline-flex items-center justify-between gap-x-3 w-full md:text-lg font-semibold text-left text-black transition"
                    aria-controls={`hs-accordion-collapse-${index}`}
                    onClick={() => toggleAccordion(index)}
                  >
                    {item.question}
                    <span>
                      {active === index ? (
                        <span className="block w-3 h-3 text-black">-</span>
                      ) : (
                        <span className="block w-3 h-3 text-black">+</span>
                      )}
                    </span>
                  </button>
                  <div
                    id={`hs-accordion-collapse-${index}`}
                    className={`hs-accordion-content transition-all duration-300 overflow-hidden ${
                      active === index ? "block" : "hidden"
                    }`}
                  >
                    <p className="text-black">{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
