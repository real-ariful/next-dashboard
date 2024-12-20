'use client'

import { lusitana } from '@/app/ui/fonts';
import { Metadata } from 'next';
import { useState } from 'react';

// export const metadata: Metadata = {
//   title: 'PDF Viewer with Chat',
// };

// Types
type Message = {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
}

type PageProps = {
  searchParams?: {
    query?: string;
    page?: string;
  }
}

// Chat Component
const ChatBox = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'User', // In a real app, this would be the actual user
      timestamp: new Date()
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg bg-white">
      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.sender === 'User' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block max-w-[70%] p-3 rounded-lg ${
                message.sender === 'User'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p>{message.text}</p>
              <span className="text-xs opacity-75">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

// PDF Viewer Component
const PDFViewer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pdfUrl, setPdfUrl] = useState<string>('');

  const handleUpload = async (file: File) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const fileUrl = URL.createObjectURL(file);
      setPdfUrl(fileUrl);
      setSuccess('PDF uploaded successfully!');

      const formData = new FormData();
      formData.append('file', file);

      // const response = await fetch('/api/upload', {
      //   method: 'POST',
      //   body: formData,
      // });

      // const data = await response.json();
      // if (!response.ok) throw new Error(data.message || 'Upload failed');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload PDF');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }

    await handleUpload(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          disabled={isLoading}
          onClick={() => document.getElementById('pdf-upload')?.click()}
          className={`${lusitana.className} px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 flex items-center gap-2`}
        >
          {isLoading ? (
            <span className="inline-block w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
          ) : (
            <span className="text-lg">📄</span>
          )}
          {isLoading ? 'Uploading...' : 'Upload PDF'}
        </button>
        
        <input
          id="pdf-upload"
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md">
          ❌ {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-2 rounded-md">
          ✅ {success}
        </div>
      )}

      
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg overflow-hidden">
            {pdfUrl && (
              <iframe
                src={`${pdfUrl}#toolbar=0`}
                className="w-full h-[600px]"
                title="PDF Viewer"
              />)}
            </div>
          <ChatBox />
        </div>
      
    </div>
  );
};

export default async function Page({ searchParams }: PageProps) {
  return (
    <main className="p-6">
      <h1 className={`${lusitana.className} text-2xl font-bold mb-6`}>
        PDF Viewer with Chat
      </h1>
      <div className="max-w-6xl">
        <PDFViewer />
      </div>
    </main>
  );
}