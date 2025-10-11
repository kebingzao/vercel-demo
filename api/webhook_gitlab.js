module.exports = (request, response) => {
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
  // In a real application, you would process the payload here.
  console.log('Successfully validated webhook from GitLab.');
  console.log('Payload:', JSON.stringify(request.body, null, 2));

  // Respond to GitLab to acknowledge receipt of the webhook.
  response.status(200).send('Webhook received and validated.');
};
