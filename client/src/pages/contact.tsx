import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin, MessageCircle, Send } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { apiRequest } from "@/lib/queryClient";

const contactFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function Contact() {
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      return apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you within 2 hours.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    contactMutation.mutate(data);
  };

  const contactInfo = [
    {
      icon: <Phone className="text-white text-xl" />,
      bgColor: "bg-fresh-green",
      title: "Phone Support",
      value: "+92 300 1234567",
      subtitle: "Available 9 AM - 9 PM"
    },
    {
      icon: <FaWhatsapp className="text-white text-xl" />,
      bgColor: "bg-sunny-yellow",
      title: "WhatsApp",
      value: "+92 300 1234567",
      subtitle: "Quick responses guaranteed"
    },
    {
      icon: <Mail className="text-white text-xl" />,
      bgColor: "bg-fresh-green",
      title: "Email",
      value: "support@freshbox.pk",
      subtitle: "Response within 2 hours"
    },
    {
      icon: <MapPin className="text-white text-xl" />,
      bgColor: "bg-sunny-yellow",
      title: "Service Areas",
      value: "Lahore, Karachi, Islamabad, Rawalpindi",
      subtitle: "Expanding to more cities soon"
    }
  ];

  return (
    <div className="min-h-screen py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-dark-text mb-4">Get In Touch</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions about our products or need support with your order? We're here to help you 24/7.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-dark-text mb-6">Contact Information</h2>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className={`w-12 h-12 ${info.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      {info.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-dark-text mb-1">{info.title}</h4>
                      <p className="text-gray-600">{info.value}</p>
                      <p className="text-sm text-gray-500">{info.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Chat Widget */}
            <Card className="bg-gradient-to-br from-fresh-green to-[hsla(103,38%,57%,0.8)] text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-semibold">Live Chat Support</h4>
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <p className="text-white/90 mb-4">Get instant help from our customer support team.</p>
                <Button
                  onClick={() => setIsLiveChatOpen(!isLiveChatOpen)}
                  className="bg-white text-fresh-green hover:bg-gray-100"
                >
                  <MessageCircle className="mr-2 w-5 h-5" />
                  {isLiveChatOpen ? "Close Chat" : "Start Chat"}
                </Button>
                {isLiveChatOpen && (
                  <div className="mt-4 p-4 bg-white/10 rounded-lg">
                    <p className="text-white/90 text-sm">
                      Live chat feature coming soon! For now, please use WhatsApp or email for instant support.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="bg-light-green-tint">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-dark-text mb-6">Send us a Message</h3>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-dark-text">First Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your first name"
                              className="rounded-xl border-gray-200 focus:border-fresh-green focus:ring-2 focus:ring-[hsla(103,38%,57%,0.2)]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-dark-text">Last Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your last name"
                              className="rounded-xl border-gray-200 focus:border-fresh-green focus:ring-2 focus:ring-[hsla(103,38%,57%,0.2)]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-dark-text">Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="your.email@example.com"
                            className="rounded-xl border-gray-200 focus:border-fresh-green focus:ring-2 focus:ring-[hsla(103,38%,57%,0.2)]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-dark-text">Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+92 300 1234567"
                            className="rounded-xl border-gray-200 focus:border-fresh-green focus:ring-2 focus:ring-[hsla(103,38%,57%,0.2)]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-dark-text">Subject</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl border-gray-200 focus:border-fresh-green focus:ring-2 focus:ring-[hsla(103,38%,57%,0.2)]">
                              <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="general">General Inquiry</SelectItem>
                            <SelectItem value="order">Order Support</SelectItem>
                            <SelectItem value="product">Product Question</SelectItem>
                            <SelectItem value="delivery">Delivery Issue</SelectItem>
                            <SelectItem value="payment">Payment Help</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-dark-text">Message</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={4}
                            placeholder="Tell us how we can help you..."
                            className="rounded-xl border-gray-200 focus:border-fresh-green focus:ring-2 focus:ring-[hsla(103,38%,57%,0.2)] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={contactMutation.isPending}
                    className="w-full bg-fresh-green text-white hover:bg-[hsla(103,38%,57%,0.9)] rounded-xl py-4 font-semibold transition-all"
                  >
                    <Send className="mr-2 w-5 h-5" />
                    {contactMutation.isPending ? "Sending..." : "Send Message"}
                  </Button>

                  <p className="text-sm text-gray-600 text-center">
                    We'll get back to you within 2 hours during business hours.
                  </p>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
