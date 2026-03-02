export default {
    async fetch(request, env, ctx) {
        // Handling CORS for frontend requests
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*", // Or replace with your specific domain e.g., "https://kumar-aman.com"
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        };

        // Preflight request
        if (request.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        if (request.method === "POST") {
            try {
                const url = new URL(request.url);
                const path = url.pathname;

                // Read the JSON body from the request
                const reqBody = await request.json();

                // ── DATABASE (HIDDEN FROM FRONTEND) ──
                // This maps allowed Client IDs to specific order amounts in paise (INR) or cents (USD)
                // e.g. 150000 paise = 1500 INR. This acts as both the identifier and the complex password.
                const paymentDatabase = {
                    "SECURE-1.5K-H8J2C5T9": { amount: 4500, currency: "INR", receipt: "rcpt_4500" },
                    "SECURE-8K-L9X2R5W1": { amount: 9000, currency: "INR", receipt: "rcpt_9000" },
                    "SECURE-10K-A7V3Q8M9": { amount: 3500, currency: "INR", receipt: "rcpt_3500" },
                    "SECURE-12K-P4N6Y1B2": { amount: 4000, currency: "INR", receipt: "rcpt_4000" },
                    "SECURE-15K-Z3M7F4D6": { amount: 5000, currency: "INR", receipt: "rcpt_5000" }
                };

                // Helper function to send JSON responses
                const sendJSON = (data, status = 200) => {
                    return new Response(JSON.stringify(data), {
                        status,
                        headers: { "Content-Type": "application/json", ...corsHeaders },
                    });
                };

                // ── 1. ENDPOINT: CREATE ORDER ──
                if (path === "/create-order" || path === "/") {
                    const clientId = reqBody.clientId ? reqBody.clientId.trim().toUpperCase() : "";
                    const clientData = paymentDatabase[clientId];

                    if (!clientData) {
                        return sendJSON({ success: false, error: "Invalid Client ID" }, 404);
                    }

                    // Securely fetch Razorpay keys from Cloudflare Environment Variables
                    // (You will set these up in the Cloudflare Dashboard)
                    const RAZORPAY_KEY_ID = env.RAZORPAY_KEY_ID;
                    const RAZORPAY_KEY_SECRET = env.RAZORPAY_KEY_SECRET;

                    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
                        return sendJSON({ success: false, error: "Server Configuration Error: Missing API Keys" }, 500);
                    }

                    // Create the Razorpay Order via their standard API
                    const basicAuth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);

                    const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Basic ${basicAuth}`
                        },
                        body: JSON.stringify({
                            amount: clientData.amount,
                            currency: clientData.currency,
                            receipt: clientData.receipt
                        })
                    });

                    const orderData = await orderResponse.json();

                    if (orderResponse.ok) {
                        return sendJSON({
                            success: true,
                            orderId: orderData.id,
                            amount: clientData.amount,
                            currency: clientData.currency,
                            keyId: RAZORPAY_KEY_ID // Safe to send to frontend for Checkout popup
                        });
                    } else {
                        return sendJSON({ success: false, error: "Failed to create order with Razorpay", details: orderData }, 500);
                    }
                }

                // ── 2. ENDPOINT: VERIFY PAYMENT ──
                if (path === "/verify-payment") {
                    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = reqBody;

                    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                        return sendJSON({ success: false, error: "Missing payment details for verification" }, 400);
                    }

                    const RAZORPAY_KEY_SECRET = env.RAZORPAY_KEY_SECRET;

                    // Verify the signature using Web Crypto API (HMAC SHA-256)
                    const encoder = new TextEncoder();
                    const keyData = encoder.encode(RAZORPAY_KEY_SECRET);
                    const messageData = encoder.encode(`${razorpay_order_id}|${razorpay_payment_id}`);

                    const cryptoKey = await crypto.subtle.importKey(
                        "raw",
                        keyData,
                        { name: "HMAC", hash: "SHA-256" },
                        false,
                        ["verify", "sign"]
                    );

                    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);

                    // Convert ArrayBuffer to Hex String
                    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
                    const expectedSignature = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');

                    if (expectedSignature === razorpay_signature) {
                        return sendJSON({ success: true, verified: true });
                    } else {
                        return sendJSON({ success: false, error: "Payment verification failed. Invalid signature." }, 400);
                    }
                }

                return sendJSON({ success: false, error: "Not Found" }, 404);

            } catch (e) {
                return new Response(
                    JSON.stringify({ success: false, error: `Internal Server Error: ${e.message}` }),
                    {
                        status: 500,
                        headers: { "Content-Type": "application/json", ...corsHeaders },
                    }
                );
            }
        }

        // Only allow POST requests for the API
        return new Response("Method Not Allowed", {
            status: 405,
            headers: corsHeaders,
        });
    },
};
