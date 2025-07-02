'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Volume2, Mic } from 'lucide-react'

interface VoiceSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export default function VoiceSettings({ isOpen, onClose }: VoiceSettingsProps) {
  const [useWhisper, setUseWhisper] = useState(false)
  const [useEnhancedTTS, setUseEnhancedTTS] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState('alloy')
  const [ttsModel, setTtsModel] = useState('openai/tts-1')
  const [apiStatus, setApiStatus] = useState<{
    whisper: boolean
    tts: boolean
  }>({ whisper: false, tts: false })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUseWhisper(localStorage.getItem('useWhisper') === 'true')
      setUseEnhancedTTS(localStorage.getItem('enableEnhancedTTS') === 'true')
      setSelectedVoice(localStorage.getItem('selectedVoice') || 'alloy')
      setTtsModel(localStorage.getItem('ttsModel') || 'openai/tts-1')
    }
    
    checkApiStatus()
  }, [])

  const checkApiStatus = async () => {
    try {
      // Check if Whisper is available
      const whisperResponse = await fetch('/api/transcribe', {
        method: 'POST',
        body: new FormData(), // Empty form data to test endpoint
      })
      
      // Check if TTS is available
      const ttsResponse = await fetch('/api/tts-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: '' }), // Empty text to test endpoint
      })

      setApiStatus({
        whisper: whisperResponse.status !== 500, // 500 means no API key
        tts: ttsResponse.status !== 500,
      })
    } catch (error) {
      console.error('Error checking API status:', error)
      setApiStatus({ whisper: false, tts: false })
    }
  }

  const handleSaveSettings = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('useWhisper', useWhisper.toString())
      localStorage.setItem('enableEnhancedTTS', useEnhancedTTS.toString())
      localStorage.setItem('selectedVoice', selectedVoice)
      localStorage.setItem('ttsModel', ttsModel)
    }
    
    // Trigger a page reload to apply settings
    window.location.reload()
  }

  const testVoice = async () => {
    if (!useEnhancedTTS) return
    
    try {
      const response = await fetch('/api/tts-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `Hello! This is a test of the ${selectedVoice} voice using ${ttsModel} model.`,
          voice: selectedVoice,
          model: ttsModel,
        }),
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        await audio.play()
        
        setTimeout(() => URL.revokeObjectURL(audioUrl), 1000)
      }
    } catch (error) {
      console.error('Voice test error:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Voice Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* API Status */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium mb-2">API Status</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span>Whisper (Speech Recognition):</span>
                <span className={apiStatus.whisper ? 'text-green-600' : 'text-red-600'}>
                  {apiStatus.whisper ? '✓ Available' : '✗ Not Available'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Enhanced TTS:</span>
                <span className={apiStatus.tts ? 'text-green-600' : 'text-red-600'}>
                  {apiStatus.tts ? '✓ Available' : '✗ Not Available'}
                </span>
              </div>
            </div>
          </div>

          {/* Speech Recognition Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              <Label className="font-medium">Speech Recognition</Label>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="whisper-toggle">Use Whisper (OpenRouter/OpenAI)</Label>
                <Button
                  id="whisper-toggle"
                  variant={useWhisper ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUseWhisper(!useWhisper)}
                  disabled={!apiStatus.whisper}
                >
                  {useWhisper ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
              <p className="text-xs text-gray-600">
                {apiStatus.whisper 
                  ? 'Higher accuracy speech recognition via OpenRouter or OpenAI'
                  : 'Requires OPENROUTER_API_KEY or OPENAI_API_KEY'
                }
              </p>
            </div>
          </div>

          {/* Text-to-Speech Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              <Label className="font-medium">Text-to-Speech</Label>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="tts-toggle">Use Enhanced TTS</Label>
                <Button
                  id="tts-toggle"
                  variant={useEnhancedTTS ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUseEnhancedTTS(!useEnhancedTTS)}
                  disabled={!apiStatus.tts}
                >
                  {useEnhancedTTS ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
              <p className="text-xs text-gray-600">
                {apiStatus.tts 
                  ? 'High-quality AI voices via OpenAI (OpenRouter TTS not yet supported)'
                  : 'Requires OPENAI_API_KEY (OpenRouter does not support TTS endpoints)'
                }
              </p>
            </div>

            {useEnhancedTTS && apiStatus.tts && (
              <>
                <div className="space-y-2">
                  <Label>Voice</Label>
                  <Select onValueChange={setSelectedVoice}>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedVoice} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alloy">Alloy (Balanced)</SelectItem>
                      <SelectItem value="echo">Echo (Male)</SelectItem>
                      <SelectItem value="fable">Fable (British)</SelectItem>
                      <SelectItem value="onyx">Onyx (Deep)</SelectItem>
                      <SelectItem value="nova">Nova (Young Female)</SelectItem>
                      <SelectItem value="shimmer">Shimmer (Soft Female)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Model Quality</Label>
                  <Select onValueChange={setTtsModel}>
                    <SelectTrigger>
                      <SelectValue placeholder={ttsModel} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai/tts-1">Standard Quality (Fast)</SelectItem>
                      <SelectItem value="openai/tts-1-hd">HD Quality (Better)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={testVoice} 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                >
                  Test Voice
                </Button>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSaveSettings} className="flex-1">
              Save & Apply
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}