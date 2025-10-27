/**
 * Clerk Integration
 * Handles user sync and session creation with Clerk
 */

/**
 * Create user in Clerk and return session information
 * Called after signup is complete (email verified + company created)
 */
export async function createClerkUser(
  email: string,
  firstName: string,
  lastName: string,
  password: string
): Promise<{
  success: boolean;
  userId?: string;
  sessionId?: string;
  error?: string;
}> {
  try {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      console.warn("[CLERK] CLERK_SECRET_KEY not configured");
      return {
        success: false,
        error: "Clerk not configured",
      };
    }

    // Step 1: Check if user already exists in Clerk
    const searchResponse = await fetch("https://api.clerk.com/v1/users", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!searchResponse.ok) {
      const error = await searchResponse.text();
      console.error("[CLERK] User search failed:", error);
      return {
        success: false,
        error: "Error verifying user in Clerk",
      };
    }

    const existingUsers = (await searchResponse.json()) as any[];
    const userExists = existingUsers.some((u) => u.email_addresses?.[0]?.email_address === email);

    if (userExists) {
      console.log(`[CLERK] User ${email} already exists in Clerk`);
      // User exists, we'll let them login instead
      return {
        success: false,
        error: "User already exists in Clerk",
      };
    }

    // Step 2: Create user in Clerk
    const createUserResponse = await fetch("https://api.clerk.com/v1/users", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: [email],
        password,
        first_name: firstName,
        last_name: lastName,
        skip_password_requirement: false,
      }),
    });

    if (!createUserResponse.ok) {
      const error = await createUserResponse.text();
      console.error("[CLERK] User creation failed:", error);
      return {
        success: false,
        error: "Error creating user in Clerk",
      };
    }

    const clerkUser = (await createUserResponse.json()) as any;
    const clerkUserId = clerkUser.id;

    console.log(`[CLERK] User created: ${clerkUserId}`);

    // Step 3: Create session for the user
    const sessionResponse = await fetch(
      `https://api.clerk.com/v1/users/${clerkUserId}/sessions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actor: {
            type: "user",
            user_id: clerkUserId,
          },
        }),
      }
    );

    if (!sessionResponse.ok) {
      const error = await sessionResponse.text();
      console.error("[CLERK] Session creation failed:", error);
      // Session creation failed, but user was created
      // Return user ID so user can login manually
      return {
        success: true,
        userId: clerkUserId,
        error: "User created but session creation failed",
      };
    }

    const sessionData = (await sessionResponse.json()) as any;

    console.log(`[CLERK] Session created: ${sessionData.id}`);

    return {
      success: true,
      userId: clerkUserId,
      sessionId: sessionData.id,
    };
  } catch (error) {
    console.error("[CLERK] Unexpected error:", error);
    return {
      success: false,
      error: "Unexpected error creating user in Clerk",
    };
  }
}

/**
 * Get user info from Clerk
 */
export async function getClerkUser(clerkUserId: string): Promise<{
  success: boolean;
  user?: any;
  error?: string;
}> {
  try {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      return {
        success: false,
        error: "Clerk not configured",
      };
    }

    const response = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: "User not found in Clerk",
      };
    }

    const user = await response.json();
    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error("[CLERK] Error getting user:", error);
    return {
      success: false,
      error: "Error retrieving user from Clerk",
    };
  }
}

/**
 * Delete user from Clerk (cleanup if needed)
 */
export async function deleteClerkUser(clerkUserId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      return {
        success: false,
        error: "Clerk not configured",
      };
    }

    const response = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: "Failed to delete user from Clerk",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("[CLERK] Error deleting user:", error);
    return {
      success: false,
      error: "Error deleting user from Clerk",
    };
  }
}
