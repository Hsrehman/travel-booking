export const vibeConfig = {
  clientId: process.env.VIBE_CLIENT_ID,
  clientSecret: process.env.VIBE_CLIENT_SECRET,
  storefrontUrl: process.env.VIBE_STOREFRONT_URL,
  getAuthHeader() {
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    return `Basic ${credentials}`;
  }
};
