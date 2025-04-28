import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// IMPORTANT: Ensure SUPABASE_JWT_SECRET is set in your .env file!
// You can find this in your Supabase project settings -> API -> JWT Settings

// Extend the Request type to include the user property
export interface AuthedRequest extends Request {
  user?: { 
    id: string; // Supabase uses 'sub' claim for user ID
    email?: string; 
    // Add other JWT payload properties if needed, e.g., role
  }; 
}

export function authMiddleware(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  // Check for the secret inside the function and add debugging
  console.log("In authMiddleware, process.env keys:", Object.keys(process.env).filter(key => key.includes('SUPABASE')));
  
  // Use hardcoded secret as fallback if environment variable is missing
  const secret = process.env.SUPABASE_JWT_SECRET || 'sHC4q65fKLPu2vGxAr0fDlnOQuKosDO8/VC+lJEVmxt8O0tR6f1MfcAVkdqfByVDPdUHcJuL5bMAmCJGDOSliw==';
  
  if (!process.env.SUPABASE_JWT_SECRET) {
    console.warn("Using hardcoded JWT secret as fallback - this should only happen in development!");
  }

  const header = req.headers.authorization;
  // Check if header exists and starts with "Bearer "
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing or invalid Bearer token" });
  }

  const token = header.slice(7); // Remove "Bearer " prefix

  try {
    // Verify the token using the Supabase JWT secret directly from process.env
    const payload = jwt.verify(token, secret) as { sub: string; email?: string, role?: string /* Add other expected claims */ };
    
    // Attach user information to the request object
    req.user = { 
        id: payload.sub, // 'sub' claim typically holds the user ID
        email: payload.email,
        // role: payload.role // Example: Attach role if present in JWT
    };

    return next(); // Token is valid, proceed to the next middleware/route handler

  } catch (err: any) {
    console.error("JWT verification failed:", err.message);
    // Handle specific JWT errors
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: "Unauthorized: Token expired" });
    }
    if (err.name === 'JsonWebTokenError') {
         return res.status(401).json({ error: "Unauthorized: Invalid token signature" });
    }
    // Generic invalid token error
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
} 