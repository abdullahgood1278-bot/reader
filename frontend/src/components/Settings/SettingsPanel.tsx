import React, { useState, useEffect } from 'react';
import { useReaderStore } from '../../stores/readerStore';
import { preferencesAPI } from '../../services/api';
import { 
  Settings, 
  Palette, 
  Zap, 
  Type, 
  Eye, 
  Moon, 
  Sun, 
  Volume2,
  Save,
  RotateCcw
} from 'lucide-react';

interface ColorScheme {
  text: string;
  background: string;
  highlight: string;
}

interface SettingsPanelProps {
  onClose: () => void;
}

const PRESET_THEMES = {
  dark: {
    name: 'Dark',
    colorScheme: { text: '#ffffff', background: '#1a1a1a', highlight: '#ff0000' }
  },
  light: {
    name: 'Light', 
    colorScheme: { text: '#1a1a1a', background: '#ffffff', highlight: '#cc0000' }
  },
  sepia: {
    name: 'Sepia',
    colorScheme: { text: '#3c2f2f', background: '#f4ecd8', highlight: '#8b4513' }
  },
  blue: {
    name: 'Ocean Blue',
    colorScheme: { text: '#ffffff', background: '#0d1b2a', highlight: '#4a90e2' }
  },
  green: {
    name: 'Forest',
    colorScheme: { text: '#f0f8f0', background: '#1b4332', highlight: '#52b788' }
  }
};

const RED_LETTER_POSITIONS = [
  { value: 'first', label: 'First Letter' },
  { value: 'middle', label: 'Middle Letter' },
  { value: 'last', label: 'Last Letter' },
  { value: 'random', label: 'Random Position' }
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const { preferences, setPreferences } = useReaderStore();
  const [localSettings, setLocalSettings] = useState(preferences || {});
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalSettings(preferences || {});
  }, [preferences]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await preferencesAPI.update(localSettings);
      setPreferences(response.data.preferences);
      setHasChanges(false);
      onClose();
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setLocalSettings({
      default_wpm: 300,
      red_letter_position: 'first',
      font_size: 48,
      theme: 'dark',
      color_scheme: PRESET_THEMES.dark.colorScheme,
      pause_on_punctuation: true,
      background_overlay_intensity: 50
    });
    setHasChanges(true);
  };

  const updateLocalSettings = (updates: any) => {
    setLocalSettings({ ...localSettings, ...updates });
    setHasChanges(true);
  };

  const applyTheme = (theme: string) => {
    const presetTheme = PRESET_THEMES[theme as keyof typeof PRESET_THEMES];
    if (presetTheme) {
      updateLocalSettings({
        theme,
        color_scheme: presetTheme.colorScheme
      });
    }
  };

  const currentTheme = Object.entries(PRESET_THEMES).find(
    ([key, value]) => JSON.stringify(value.colorScheme) === JSON.stringify(localSettings.color_scheme)
  )?.[0] || 'custom';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Settings className="text-blue-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reading Preferences</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-8">
            {/* Reading Speed Section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Zap className="text-yellow-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reading Speed</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default WPM: {localSettings.default_wpm || 300}
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="50"
                    value={localSettings.default_wpm || 300}
                    onChange={(e) => updateLocalSettings({ default_wpm: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>100</span>
                    <span>500</span>
                    <span>1000</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pause on Punctuation
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localSettings.pause_on_punctuation || false}
                      onChange={(e) => updateLocalSettings({ pause_on_punctuation: e.target.checked })}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Add extra pause at periods, commas, and other punctuation
                    </span>
                  </label>
                </div>
              </div>
            </section>

            {/* Visual Settings Section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Eye className="text-purple-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Visual Settings</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Font Size: {localSettings.font_size || 48}px
                  </label>
                  <input
                    type="range"
                    min="24"
                    max="96"
                    step="4"
                    value={localSettings.font_size || 48}
                    onChange={(e) => updateLocalSettings({ font_size: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>24px</span>
                    <span>60px</span>
                    <span>96px</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Red Letter Position
                  </label>
                  <select
                    value={localSettings.red_letter_position || 'first'}
                    onChange={(e) => updateLocalSettings({ red_letter_position: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {RED_LETTER_POSITIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Background Overlay Intensity: {localSettings.background_overlay_intensity || 50}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={localSettings.background_overlay_intensity || 50}
                    onChange={(e) => updateLocalSettings({ background_overlay_intensity: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>0% (Clear)</span>
                    <span>50%</span>
                    <span>100% (Dark)</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Theme Section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Palette className="text-green-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Theme & Colors</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Color Themes
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(PRESET_THEMES).map(([key, theme]) => (
                      <button
                        key={key}
                        onClick={() => applyTheme(key)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          currentTheme === key
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex space-x-1">
                            <div
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: theme.colorScheme.background }}
                            />
                            <div
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: theme.colorScheme.text }}
                            />
                            <div
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: theme.colorScheme.highlight }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {theme.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom Colors</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Text Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={localSettings.color_scheme?.text || '#ffffff'}
                          onChange={(e) => updateLocalSettings({
                            color_scheme: {
                              ...localSettings.color_scheme,
                              text: e.target.value
                            }
                          })}
                          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={localSettings.color_scheme?.text || '#ffffff'}
                          onChange={(e) => updateLocalSettings({
                            color_scheme: {
                              ...localSettings.color_scheme,
                              text: e.target.value
                            }
                          })}
                          className="flex-1 p-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Background</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={localSettings.color_scheme?.background || '#1a1a1a'}
                          onChange={(e) => updateLocalSettings({
                            color_scheme: {
                              ...localSettings.color_scheme,
                              background: e.target.value
                            }
                          })}
                          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={localSettings.color_scheme?.background || '#1a1a1a'}
                          onChange={(e) => updateLocalSettings({
                            color_scheme: {
                              ...localSettings.color_scheme,
                              background: e.target.value
                            }
                          })}
                          className="flex-1 p-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Highlight</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={localSettings.color_scheme?.highlight || '#ff0000'}
                          onChange={(e) => updateLocalSettings({
                            color_scheme: {
                              ...localSettings.color_scheme,
                              highlight: e.target.value
                            }
                          })}
                          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={localSettings.color_scheme?.highlight || '#ff0000'}
                          onChange={(e) => updateLocalSettings({
                            color_scheme: {
                              ...localSettings.color_scheme,
                              highlight: e.target.value
                            }
                          })}
                          className="flex-1 p-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Keyboard Shortcuts Section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Type className="text-orange-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Keyboard Shortcuts</h3>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">Reading Controls</h4>
                    <div className="space-y-1 text-gray-600 dark:text-gray-300">
                      <div className="flex justify-between">
                        <span>Play/Pause</span>
                        <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs">Space</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Exit Reader</span>
                        <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs">Esc</kbd>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">Speed Control</h4>
                    <div className="space-y-1 text-gray-600 dark:text-gray-300">
                      <div className="flex justify-between">
                        <span>Increase (+50)</span>
                        <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs">↑</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Decrease (-50)</span>
                        <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs">↓</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Fine-tune (+10)</span>
                        <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs">+</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Fine-tune (-10)</span>
                        <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs">-</kbd>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">Navigation</h4>
                    <div className="space-y-1 text-gray-600 dark:text-gray-300">
                      <div className="flex justify-between">
                        <span>Next Word</span>
                        <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs">→</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Previous Word</span>
                        <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs">←</kbd>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
          >
            <RotateCcw size={18} />
            Reset to Defaults
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Save size={18} />
              {isLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};