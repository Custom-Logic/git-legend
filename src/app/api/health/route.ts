/**
 * @file This file contains the API route for checking the health of the application.
 * @exports GET
 */

import { NextResponse } from "next/server";

/**
 * Handles GET requests to the /api/health route.
 *
 * @returns {Promise<NextResponse>} A response object.
 */
export async function GET() {
  return NextResponse.json({ message: "Good!" });
}