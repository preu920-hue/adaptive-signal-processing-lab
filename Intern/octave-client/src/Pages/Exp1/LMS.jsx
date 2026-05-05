import React, { useState } from 'react';
import axios from 'axios';
import image from '../../image.png';

const LMS = () => {
  const [selectedFile, setSelectedFile] = useState('simulated1.csv');
  const [inputs, setInputs] = useState([
    { id: 'step-size', label: 'Step-size', min: 0.001, max: 0.1, step: 0.0001, value: 0.2 },
    { id: 'order', label: 'Order of Filter (M)', min: 2, max: 100, step: 1, value: 50 }
  ]);

  const [code, setCode] = useState('');
  const [codeHtml, setCodeHtml] = useState('Code will be generated here.!');
  const [imageUrls, setImageUrls] = useState(new Array(5).fill(image));
  const [loading, setLoading] = useState(false);
  const [showImages, setShowImages] = useState(false);

  const handleFileChange = (file) => {
    setSelectedFile(file);
    console.log(file);
  };

  const handleInputChange = (id, value) => {
    const input = inputs.find(input => input.id === id);
    const newValue = Math.min(Math.max(value, input.min), input.max);
    setInputs(inputs.map(input => input.id === id ? { ...input, value: newValue } : input));
  };

   const fileOptions = [
    { name: 'simulated.csv', file: 'simulated1.csv' },
    { name: 'real.csv', file: 'real.csv' }
  ];

  const handleGenerateCode = () => {
    const generatedCode = `
function lms_denoise(mu, inputFile, M, uniqueIdentifier)
    % Function to apply LMS denoising to an EEG signal
    %
    % Parameters:
    %   mu: Step size for LMS
    %   inputFile: Name of the input .csv file containing the EEG signal
    %   M: Length of the LMS filter
    %   uniqueIdentifier: Unique identifier for saving the image

    % Default values for fs
    fs = 100;  % Sampling frequency in Hz

    clc;
    close all;

    % Load the EEG signal from the input file
    x = csvread(inputFile);

    % Check the length of the signal
    n = length(x);

    % Initialize LMS weight vector
    w_lms = zeros(M, 1); % Initialize LMS weight vector

    % Generate the signal corrupted with noise
    D = x;
    A = D + 0.5 * randn(size(D)); % Simulated noisy signal

    % Initialization for LMS algorithm
    B_lms = zeros(1, n); % LMS output signal
    Err_lms = zeros(1, n); % LMS error signal
    weights_lms = zeros(M, n); % Array to store LMS weights

    % Adding padding to the signal for multi-tap processing
    A_padded = [zeros(M-1, 1); A]; % Transpose the zeros matrix to make it compatible with A
    t = (0:n-1) / fs;

    % Apply the LMS algorithm
    for i = M:n
        % Extract the current segment of the signal for multi-tap processing
        A_i = A_padded(i:-1:i-M+1);
        
        y_lms = w_lms' * A_i;
        Err_lms(i) = D(i) - y_lms;
        w_lms = w_lms + mu * A_i * Err_lms(i);
        weights_lms(:, i) = w_lms;
        B_lms(i) = w_lms' * A_i;
    end

    % Display the signals
    figure('Position', [100, 100, 800, 800]); % Increase figure height
    subplot(4,1,1), plot(t, D);
    title('Desired Signal');
    xlabel('Time (s)');
    ylabel('Amplitude');
    subplot(4,1,2), plot(t, A);
    title('Signal Corrupted with Noise');
    xlabel('Time (s)');
    ylabel('Amplitude');
    subplot(4,1,3), plot(t, B_lms);
    title('LMS Output Signal');
    xlabel('Time (s)');
    ylabel('Amplitude');
    legend('LMS Output');
    subplot(4,1,4), plot(t, Err_lms);
    title('LMS Error Signal');
    xlabel('Time (s)');
    ylabel('Error');
    % Adjust position to increase space between plots
    set(gcf, 'Units', 'Normalized', 'OuterPosition', [0, 0, 1, 1]);  % Maximize figure window
    set(gcf, 'PaperPositionMode', 'auto');  % Set figure size to be the same on printed paper
    % Save figure with unique identifier
    saveas(gcf, sprintf('Outputs/lms_denoise_%s.png', uniqueIdentifier));
    close(gcf);
end
`;
    setCode(generatedCode);
    setCodeHtml(`<pre>${generatedCode}</pre>`);
  };

  const handleRun = async () => {
  if (!selectedFile) {
    alert("Please select a file.");
    return;
  }

  setLoading(true);  // Start loading
  setShowImages(false);  // Hide images until new ones are loaded
  
  const data = {
    file: selectedFile,
    mu: inputs.find(input => input.id === 'step-size').value,
    order: inputs.find(input => input.id === 'order').value
  };

  try {
    const response = await axios.post('http://localhost:5000/lms-process', data, {
      headers: {
        // 'Content-Type': 'multipart/form-data'
      }
    });
    
    setImageUrls(response.data.images.map(img => `http://localhost:5000${img}`));
    setShowImages(true);  // Show images after loading
  } catch (error) {
    console.error('Error running the script:', error);
  } finally {
    setLoading(false);  // Stop loading
  }
};
  
  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "rls_denoise.m";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  const SphereLoading = () => (
  <div className="flex felx-col fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 ">
    <div className="w-20 h-10">
      <div className="relative w-full h-full overflow-hidden p-2 pl-3">
        <p className='font-sans text-sm font-bold'>Loading...</p>
        <div className="absolute inset-0 bg-blue-button rounded-lg animate-pulse opacity-0 text-black">
        </div>
        
      </div>
    </div>
  </div>  
);

  return (
    <div className='flex flex-col space-y-10'>
      <div className="flex flex-row gap-5 justify-between space-x-5"> 
          <div className='flex flex-col'>
          <iframe
            srcDoc={codeHtml}
            title="Generated Code"
            width="650"
            height="262"
            className='outline border-4 p-2 rounded-sm border-blue-hover'
          ></iframe>
          <div className='flex justify-between '>
            <button 
              className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-8"
              onClick={handleDownload}
            >
              Download
            </button>
            <button 
              className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-8"
              onClick={handleRun}
            >
              Submit & Run
            </button>
          </div>
        </div>
        
        <div className="text-sm">
          <div className="flex flex-col">
            <p className="mb-2 ml-12 font-bold">Select CSV file of Input</p>
             <select
              onChange={(e) => handleFileChange(e.target.value)}
              className="bg-white border border-black rounded-lg px-3 py-1 focus:outline-none "
            >
              {fileOptions.map((option, index) => (
                <option key={index} value={option.file} >{option.name}</option>
              ))}
            </select>
          </div>
          <div className='flex flex-col mt-8 items-center '>
            <p className='font-bold'> Select the input Parameters</p>
            <div className='bg-blue-hover px-5 py-3 mt-2 rounded-xl'>
              {inputs.map(input => (
                <div key={input.id} className="flex flex-col items-center">
                  <label htmlFor={input.id} className="block mb-2">
                    <pre className='font-serif'>
                      <span>{input.min} ≤ </span> {input.label} <span> ≤  {input.max} </span>
                    </pre>
                  </label>
                  <div className="flex flex-row items-center">
                    <input
                      type="number"
                      id={input.id}
                      min={input.min}
                      max={input.max}
                      step={input.step}
                      value={input.value}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      className="w-16 text-center border border-gray-300 rounded-lg py-1 focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="range"
                      min={input.min}
                      max={input.max}
                      step={input.step}
                      value={input.value}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      className="flex-grow ml-2 "
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col">
            <button onClick={handleGenerateCode} className="bg-blue-button rounded-lg px-3 py-1 hover:bg-blue-hover mt-10 text-base">
              Generate Code
            </button>
          </div>
        </div>
      </div>
       {loading && <SphereLoading/>}
        {!loading && showImages && (
          <div className='flex flex-col'>
            {imageUrls.map((url, index) => (
              <img key={index} src={url} alt={`Output ${index + 1}`} />
            ))}
          </div>
        )}
    </div>
  );
};

export default LMS;