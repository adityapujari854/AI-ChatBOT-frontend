// src/app/api/stream/route.ts

import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic'; // Enables dynamic rendering for streaming

export async function POST(req: NextRequest) {
  try {
    const { prompt, session_id, user_id, language } = await req.json();
    const encoder = new TextEncoder();

    // Create stream with proper abort handling
    const stream = new ReadableStream({
      async start(controller) {
        // Get the abort signal from the request
        const signal = req.signal;
        let isAborted = false;

        // Add event listener for abort
        const onAbort = () => {
          isAborted = true;
          console.log('Stream aborted by client');
          controller.close();
        };
        signal.addEventListener('abort', onAbort);

        // Simulated response tokens (replace with actual LLM streaming)
        const responseTokens = [
          `Processing your request: "${prompt}"\n\n`,
          `Session: ${session_id}\n`,
          `Language: ${language}\n\n`,
          `Here is my response:\n\n`,
          `You asked about "${prompt}". `,
          `This is a simulated streaming response. `,
          `In a real implementation, this would be actual AI-generated content.`
        ];

        try {
          for (const token of responseTokens) {
            // Check if request was aborted
            if (signal.aborted || isAborted) {
              console.log('Stream aborted during token processing');
              return;
            }

            // Send the token to the client
            controller.enqueue(encoder.encode(token));
            
            // Simulate delay between tokens (remove in production)
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          // Finalize the stream
          controller.enqueue(encoder.encode('[DONE]'));
          controller.close();
          console.log('Stream completed successfully');
        } catch (err) {
          if (!isAborted) {
            console.error('Stream error:', err);
            controller.error(err);
          }
        } finally {
          // Clean up the abort listener
          signal.removeEventListener('abort', onAbort);
        }
      },
      
      // Handle cancellation from the client
      cancel(reason) {
        console.log('Stream cancelled by client:', reason);
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Stream-Status': 'active',
      },
    });

  } catch (err) {
    console.error('Error in stream endpoint:', err);
    return new Response(JSON.stringify({ error: 'Stream initialization failed' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}