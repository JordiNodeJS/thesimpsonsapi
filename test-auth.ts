import { auth } from "./lib/auth";

async function testAuth() {
  try {
    console.log("Testing Better Auth configuration...");

    // Try to create a user
    const result = await auth.api.signUpEmail({
      body: {
        email: "test-local@example.com",
        password: "Test123456",
        name: "Test User Local",
      },
    });

    console.log("User created:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}

testAuth();
