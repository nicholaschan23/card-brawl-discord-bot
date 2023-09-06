# Setting Up a `.env` File for Your Discord Bot

## Introduction

This guide will walk you through the process of setting up a `.env` file to securely store sensitive information such as your Discord bot token and MongoDB URI. This is an essential practice to ensure the security of your bot's credentials.

## Prerequisites

Before you begin, make sure you have the following prerequisites:

- Node.js and npm installed on your system.
- A Discord bot account and its token. You can create one by following the [Discord Developer Portal guide](https://discord.com/developers/applications).
- A MongoDB database set up and the connection URI.

## Steps

1. **Create a `.env` File:**

   Start by creating a `.env` file in the root directory of your bot project. The file should be named `.env` (with a leading period).

2. **Add Environment Variables:**

   In your `.env` file, add the following lines, replacing `YOUR_BOT_TOKEN` and `YOUR_MONGODB_URI` with your actual bot token and MongoDB URI:

   ```env
   TOKEN = "YOUR_BOT_TOKEN"
   MONGODB_URI = "YOUR_MONGODB_URI"
