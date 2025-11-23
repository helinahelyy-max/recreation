import React, { useState, useCallback, useEffect } from 'react';
import { UploadedImage, LightingOptions, StylePreset } from './types';
import { generateMergedImage } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import ResultDisplay from './components/ResultDisplay';
import { SparklesIcon, LightBulbIcon, PaintBrushIcon, InfoIcon } from './components/Icons';
import Tooltip from './components/Tooltip';

const stylePresets: StylePreset[] = [
  {
    name: 'Custom',
    prompt: 'Warm cinematic lighting, realistic shadows and reflections, smooth blending, natural depth and focus.',
  },
  {
    name: 'Photorealistic',
    prompt: 'Ultra-realistic photograph, sharp focus, natural lighting, detailed textures, 8k resolution, high dynamic range (HDR).',
    lighting: {
      ambientLightColor: '#EBF0F5',
      ambientLightIntensity: 0.4,
      directionalLightColor: '#FFFFFF',
      directionalLightIntensity: 0.6,
      shadowIntensity: 0.5,
    }
  },
  {
    name: 'Cinematic',
    prompt: 'Cinematic film still, dramatic lighting, anamorphic lens flare, moody atmosphere, high contrast, teal and orange color grading.',
    lighting: {
      ambientLightColor: '#4A5568',
      ambientLightIntensity: 0.2,
      directionalLightColor: '#FFA500',
      directionalLightIntensity: 0.8,
      shadowIntensity: 0.7,
    }
  },
  {
    name: 'Vibrant',
    prompt: 'Vibrant and colorful, high saturation, bright and sunny day, pop art style, cheerful mood.',
    lighting: {
      ambientLightColor: '#FFFFE0',
      ambientLightIntensity: 0.5,
      directionalLightColor: '#FFFFFF',
      directionalLightIntensity: 0.8,
      shadowIntensity: 0.3,
    }
  },
  {
    name: 'Muted',
    prompt: 'Muted and desaturated colors, soft and diffuse lighting, overcast day, melancholic and calm mood, matte finish.',
    lighting: {
      ambientLightColor: '#A0AEC0',
      ambientLightIntensity: 0.6,
      directionalLightColor: '#CBD5E0',
      directionalLightIntensity: 0.4,
      shadowIntensity: 0.25,
    }
  }
];

const App: React.FC = () => {
  const [subjectImage, setSubjectImage] = useState<UploadedImage | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<UploadedImage | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>(stylePresets[0].prompt);
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [selectedStyle, setSelectedStyle] = useState<string>(stylePresets[0].name);
  
  // Lighting State
  const [ambientLightColor, setAmbientLightColor] = useState<string>('#FFFFFF');
  const [ambientLightIntensity, setAmbientLightIntensity] = useState<number>(0.3);
  const [directionalLightColor, setDirectionalLightColor] = useState<string>('#FFDDAA');
  const [directionalLightIntensity, setDirectionalLightIntensity] = useState<number>(0.7);
  const [lightDirection, setLightDirection] = useState<string>('top-right');
  const [shadowIntensity, setShadowIntensity] = useState<number>(0.6);

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const aspectRatios = ['1:1', '16:9', '4:3', '9:16', '3:4'];
  const lightDirections = ['top-left', 'top', 'top-right', 'left', 'right', 'bottom-left', 'bottom', 'bottom-right'];

  useEffect(() => {
    const preset = stylePresets.find(p => p.name === selectedStyle);
    if (preset) {
      setCustomPrompt(preset.prompt);
      if (preset.lighting) {
        const {
          ambientLightColor,
          ambientLightIntensity,
          directionalLightColor,
          directionalLightIntensity,
          shadowIntensity
        } = preset.lighting;
        if (ambientLightColor) setAmbientLightColor(ambientLightColor);
        if (ambientLightIntensity !== undefined) setAmbientLightIntensity(ambientLightIntensity);
        if (directionalLightColor) setDirectionalLightColor(directionalLightColor);
        if (directionalLightIntensity !== undefined) setDirectionalLightIntensity(directionalLightIntensity);
        if (shadowIntensity !== undefined) setShadowIntensity(shadowIntensity);
      }
    }
  }, [selectedStyle]);

  const readFileAsBase64 = (file: File): Promise<UploadedImage> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve({
          file,
          preview: URL.createObjectURL(file),
          base64,
          mimeType: file.type,
        });
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleSubjectImageChange = useCallback(async (file: File) => {
    try {
      const imageData = await readFileAsBase64(file);
      setSubjectImage(imageData);
    } catch (e) {
      setError('Failed to read subject image.');
      console.error(e);
    }
  }, []);

  const handleBackgroundImageChange = useCallback(async (file: File) => {
    try {
      const imageData = await readFileAsBase64(file);
      setBackgroundImage(imageData);
    } catch (e) {
      setError('Failed to read background image.');
      console.error(e);
    }
  }, []);

  const handleGenerate = async () => {
    if (!subjectImage || !backgroundImage) {
      setError('Please upload both a subject image and a background image.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    
    // Scroll to result on mobile
    if (window.innerWidth < 1024) {
      const resultElement = document.getElementById('result-section');
      resultElement?.scrollIntoView({ behavior: 'smooth' });
    }

    const lightingOptions: LightingOptions = {
      ambientLightColor,
      ambientLightIntensity,
      directionalLightColor,
      directionalLightIntensity,
      lightDirection,
      shadowIntensity,
    };

    try {
      const resultBase64 = await generateMergedImage(
        subjectImage,
        backgroundImage,
        customPrompt,
        aspectRatio,
        lightingOptions
      );
      setGeneratedImage(`data:image/png;base64,${resultBase64}`);
    } catch (err: any) {
      setError(`Failed to generate image. ${err.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gray-900 text-gray-200 font-sans overflow-x-hidden pb-10">
      <main className="container mx-auto p-4 max-w-6xl">
        <header className="text-center mb-6 md:mb-10 pt-2">
          <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            Recreation
          </h1>
          <p className="mt-2 text-sm md:text-lg text-gray-400 max-w-2xl mx-auto px-4">
            Merge subject and background into a realistic photo.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Result Panel (Moved top for mobile if generated, otherwise stays bottom/right logic handled by flex order or user scroll) 
              Actually, for this app type, inputs first is usually better, but let's keep standard flow.
          */}
          
          {/* Controls Panel */}
          <div className="bg-gray-800/50 p-4 md:p-6 rounded-2xl shadow-lg border border-gray-700 flex flex-col space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ImageUploader
                id="subject"
                label="Subject"
                description="Person or Object"
                onImageSelect={handleSubjectImageChange}
                image={subjectImage}
              />
              <ImageUploader
                id="background"
                label="Background"
                description="Scene or Environment"
                onImageSelect={handleBackgroundImageChange}
                image={backgroundImage}
              />
            </div>

            <div className="space-y-3">
              <h3 className="flex items-center text-sm font-medium text-gray-300">
                <PaintBrushIcon className="w-5 h-5 mr-2 text-blue-400"/>
                Style Preset
              </h3>
              <div className="flex flex-wrap gap-2">
                {stylePresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setSelectedStyle(preset.name)}
                    className={`px-3 py-2 text-xs md:text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 flex-grow sm:flex-grow-0 ${
                      selectedStyle === preset.name
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-300 mb-2">
                Customizations
              </label>
              <textarea
                id="custom-prompt"
                rows={3}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 placeholder-gray-500"
                placeholder="Describe lighting or atmosphere..."
                value={customPrompt}
                onChange={(e) => {
                  setCustomPrompt(e.target.value);
                  setSelectedStyle('Custom');
                }}
              />
            </div>
            
            {/* Lighting Controls */}
            <div className="space-y-4">
              <h3 className="flex items-center text-sm font-medium text-gray-300">
                <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-400"/>
                Lighting
              </h3>
              
              {/* Ambient Light Group */}
              <div className="p-3 bg-gray-900/30 rounded-xl border border-gray-700/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <label className="text-xs md:text-sm font-medium text-gray-300 mr-2">Ambient</label>
                    <Tooltip content="Brightness of shadows and unlit areas.">
                      <InfoIcon className="w-4 h-4 text-gray-500" />
                    </Tooltip>
                  </div>
                  <input 
                    type="color" 
                    value={ambientLightColor} 
                    onChange={(e) => setAmbientLightColor(e.target.value)} 
                    className="w-8 h-8 rounded overflow-hidden cursor-pointer" 
                  />
                </div>
                <div className="flex items-center space-x-3">
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.05" 
                      value={ambientLightIntensity} 
                      onChange={(e) => setAmbientLightIntensity(parseFloat(e.target.value))} 
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 touch-manipulation" 
                    />
                    <span className="text-xs text-gray-400 w-8 text-right font-mono">{Math.round(ambientLightIntensity * 100)}%</span>
                </div>
              </div>

              {/* Directional Light Group */}
              <div className="p-3 bg-gray-900/30 rounded-xl border border-gray-700/50 space-y-4">
                <div className="space-y-3">
                   <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <label className="text-xs md:text-sm font-medium text-gray-300 mr-2">Directional Source</label>
                      <Tooltip content="Main light source (sun/lamp).">
                        <InfoIcon className="w-4 h-4 text-gray-500" />
                      </Tooltip>
                    </div>
                    <input 
                      type="color" 
                      value={directionalLightColor} 
                      onChange={(e) => setDirectionalLightColor(e.target.value)} 
                      className="w-8 h-8 rounded overflow-hidden cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.05" 
                        value={directionalLightIntensity} 
                        onChange={(e) => setDirectionalLightIntensity(parseFloat(e.target.value))} 
                        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 touch-manipulation" 
                      />
                      <span className="text-xs text-gray-400 w-8 text-right font-mono">{Math.round(directionalLightIntensity * 100)}%</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-700/50 pt-3">
                   <div className="flex items-center mb-3">
                      <label className="text-xs font-medium text-gray-400 mr-2">Direction</label>
                   </div>
                   <div className="grid grid-cols-4 gap-2">
                    {lightDirections.map((dir) => (
                      <button
                        key={dir}
                        onClick={() => setLightDirection(dir)}
                        className={`px-1 py-2 text-[10px] font-medium rounded border transition-all duration-200 ${
                          lightDirection === dir
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                            : 'bg-gray-800 border-gray-700 text-gray-400 active:bg-gray-700'
                        }`}
                      >
                        {dir.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

               {/* Shadow Intensity Group */}
               <div className="p-3 bg-gray-900/30 rounded-xl border border-gray-700/50 flex items-center justify-between">
                 <div className="flex items-center mr-2">
                    <label className="text-xs md:text-sm font-medium text-gray-300 mr-2">Shadows</label>
                  </div>
                  <div className="flex items-center space-x-3 flex-1 justify-end">
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.05" 
                      value={shadowIntensity} 
                      onChange={(e) => setShadowIntensity(parseFloat(e.target.value))} 
                      className="w-full max-w-[120px] h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 touch-manipulation" 
                    />
                    <span className="text-xs text-gray-400 w-8 text-right font-mono">{Math.round(shadowIntensity * 100)}%</span>
                  </div>
               </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Aspect Ratio
              </label>
              <div className="flex flex-wrap gap-2">
                {aspectRatios.map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 flex-1 ${
                      aspectRatio === ratio
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 sticky bottom-0 z-20 pb-safe">
              <button
                onClick={handleGenerate}
                disabled={isLoading || !subjectImage || !backgroundImage}
                className="w-full flex items-center justify-center bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-indigo-700 disabled:bg-indigo-900/50 disabled:cursor-not-allowed disabled:text-gray-400 transition-all duration-300 text-lg shadow-indigo-500/30 shadow-lg active:scale-[0.98]"
              >
                {isLoading ? (
                  'Processing...'
                ) : (
                  <>
                    <SparklesIcon className="w-6 h-6 mr-2" />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Result Panel */}
          <div id="result-section" className="bg-gray-800/50 p-4 md:p-6 rounded-2xl shadow-lg border border-gray-700 scroll-mt-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4 md:hidden">Result</h3>
            <ResultDisplay
              isLoading={isLoading}
              error={error}
              generatedImage={generatedImage}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;