import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, ControllerRenderProps } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const profileFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  postalCode: z.string().min(3, "Postal code must be at least 3 characters"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  userId: string;
}

export function ProfileForm({ userId }: ProfileFormProps) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.emailAddresses[0]?.emailAddress || "",
      phone: "",
      address: "",
      city: "",
      country: "",
      postalCode: "",
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true);

    try {
      // Here you would typically save the data to your backend
      // For now, we'll just simulate a successful save
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Success",
        description: "Your profile has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-700/80 bg-gradient-to-br from-white/80 via-white/60 to-white/90 dark:from-zinc-900/80 dark:via-zinc-800/80 dark:to-zinc-900/80 backdrop-blur-2xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500"
    >
      {/* Advanced gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/8 to-pink-500/10" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/8 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-blue-500/5 to-transparent" />
      
      {/* Animated border glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 p-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-2xl" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-white/30 rounded-full"
            style={{
              left: `${5 + i * 8}%`,
              top: `${10 + i * 7}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 4 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Profile Settings
          </h2>
          <p className="text-zinc-800 dark:text-zinc-300">
            Update your personal information and preferences
          </p>
        </motion.div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" aria-label="Profile form" role="form">
            {/* On mobile: single column, md+: two columns */}
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="group/field"
              >
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900/80 backdrop-blur-sm px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-500 focus:border-blue-500/50 focus:bg-white/90 dark:focus:bg-zinc-800/80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                        />
                      </FormControl>
                      <FormMessage>
                        {fieldState.error?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="group/field"
              >
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900/80 backdrop-blur-sm px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-500 focus:border-blue-500/50 focus:bg-white/90 dark:focus:bg-zinc-800/80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                        />
                      </FormControl>
                      <FormMessage>
                        {fieldState.error?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="group/field"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email"
                          className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900/80 backdrop-blur-sm px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-500 focus:border-blue-500/50 focus:bg-white/90 dark:focus:bg-zinc-800/80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                        />
                      </FormControl>
                      <FormMessage>
                        {fieldState.error?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="group/field"
              >
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>
                        Phone
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="tel"
                          className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900/80 backdrop-blur-sm px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-500 focus:border-blue-500/50 focus:bg-white/90 dark:focus:bg-zinc-800/80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                        />
                      </FormControl>
                      <FormMessage>
                        {fieldState.error?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="md:col-span-2 group/field"
              >
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>
                        Address
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900/80 backdrop-blur-sm px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-500 focus:border-blue-500/50 focus:bg-white/90 dark:focus:bg-zinc-800/80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                        />
                      </FormControl>
                      <FormMessage>
                        {fieldState.error?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="group/field"
              >
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>
                        City
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900/80 backdrop-blur-sm px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-500 focus:border-blue-500/50 focus:bg-white/90 dark:focus:bg-zinc-800/80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                        />
                      </FormControl>
                      <FormMessage>
                        {fieldState.error?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="group/field"
              >
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>
                        Country
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900/80 backdrop-blur-sm px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-500 focus:border-blue-500/50 focus:bg-white/90 dark:focus:bg-zinc-800/80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                        />
                      </FormControl>
                      <FormMessage>
                        {fieldState.error?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0, duration: 0.6 }}
                className="group/field"
              >
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>
                        Postal Code
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900/80 backdrop-blur-sm px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-500 focus:border-blue-500/50 focus:bg-white/90 dark:focus:bg-zinc-800/80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                        />
                      </FormControl>
                        <FormMessage>
                        {fieldState.error?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full py-5 text-lg font-semibold relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-white/10 transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed group/button"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/button:opacity-100 transition-opacity duration-300" />
                
                {isLoading ? (
                  <div className="flex items-center justify-center relative z-10">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                    <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                      Saving...
                    </span>
                  </div>
                ) : (
                  <span className="relative z-10 bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                    Save Changes
                  </span>
                )}
              </Button>
            </motion.div>
          </form>
        </Form>
      </div>
    </motion.div>
  );
} 