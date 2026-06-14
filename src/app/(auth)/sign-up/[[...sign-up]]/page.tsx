import { SignUp } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">NCE</span>
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <p className="text-gray-600 mt-2">Start your NCE Design & Technology journey today</p>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <SignUp
              appearance={{
                elements: {
                  formButtonPrimary: "bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600",
                  card: "shadow-none border-none bg-transparent",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                },
              }}
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}