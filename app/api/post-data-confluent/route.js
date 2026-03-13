export const runtime = 'edge';

import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();

        // Forwarding to the external Confluent API Gateway (Dev Endpoint)
        const externalApiUrl = 'https://devapigwpubmarketingdata.wingscorp.com/post-data-confluent';
        const apiKey = process.env.WINGSCORP_API_KEY;

        console.log(`[API Proxy] Sending data to: ${externalApiUrl}`);

        const response = await fetch(externalApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'x-api-key': apiKey,
                'User-Agent': 'Lunar-Page-Builder-Proxy',
            },
            body: JSON.stringify(body),
        });

        const status = response.status;
        const contentType = response.headers.get('content-type') || '';
        const responseText = await response.text();

        console.log(`[API Proxy] Upstream Response Status: ${status}`);

        let responseData = {};
        try {
            if (contentType.includes('application/json') || (responseText.trim().startsWith('{') || responseText.trim().startsWith('['))) {
                responseData = JSON.parse(responseText);
            } else {
                responseData = { message: responseText };
            }
        } catch (e) {
            responseData = { message: 'Could not parse response', raw: responseText };
        }

        if (!response.ok) {
            console.error(`[API Proxy] Upstream Error:`, responseData);
            return NextResponse.json(
                {
                    error: 'External API Error',
                    status,
                    data: responseData
                },
                { status: 500 }
            );
        }

        console.log(`[API Proxy] Successfully proxied data.`);
        return NextResponse.json({ success: true, data: responseData });

    } catch (error) {
        console.error('[API Proxy] Error:', error.message);
        return NextResponse.json(
            { error: 'Proxy Internal Error', message: error.message },
            { status: 500 }
        );
    }
}
