module.exports = async (request, response) => {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).send('Method Not Allowed');
  }

  const gitlabToken = request.headers['x-gitlab-token'];
  const secretToken = process.env.GITLAB_SECRET_TOKEN;

  // It's good practice to have a secret token for security.
  if (!secretToken) {
    // Log an error on the server, but don't expose details to the client.
    console.error('GITLAB_SECRET_TOKEN is not configured on the server.');
    return response.status(500).send('Internal Server Error: Webhook secret not configured.');
  }
  
  // Vercel's hobby plan might keep functions cold. A quick check like this 
  // can help ensure GitLab doesn't time out while waiting for a complex task.
  // For now, we are just validating the token.
  if (gitlabToken !== secretToken) {
    return response.status(401).send('Unauthorized: Invalid secret token.');
  }

  // Log the payload for debugging purposes.
  console.log('Successfully validated webhook from GitLab.');
  
  // Define the target endpoint for forwarding
  const forwardUrl = 'https://insight-api.airdroid.com/api/v1/workflow/exe/ctI781s9YFTpTpMp5LWpL9ygwTbBXSvpeYaa5DxM7vRFPh9Vp09ehJcc-k94q15QUDQF9lVlcmxiOudTPL_UMQ';
  
  // Prepare the payload for the forwarding request
  const forwardPayload = {
    Input: request.body
  };

  try {
    console.log(`Forwarding webhook payload to: ${forwardUrl}`);
    const forwardResponse = await fetch(forwardUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(forwardPayload),
    });

    if (forwardResponse.ok) {
      console.log('Successfully forwarded webhook. Endpoint responded with status:', forwardResponse.status);
    } else {
      // Log the error but still respond 200 to GitLab to prevent retries
      const errorBody = await forwardResponse.text();
      console.error('Failed to forward webhook. Endpoint responded with status:', forwardResponse.status);
      console.error('Response body from endpoint:', errorBody);
    }
  } catch (error) {
    console.error('An error occurred while trying to forward the webhook:', error);
  }

  // Respond to GitLab to acknowledge receipt, regardless of forwarding outcome.
  response.status(200).send('Webhook received and processed.');
};
