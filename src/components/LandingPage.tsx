'use client'

import { Button } from '@/components/ui/button'
import { SignUpButton } from '@clerk/nextjs'
import { Camera, Brain, Target, Zap, Star, CheckCircle } from 'lucide-react'

const features = [
  {
    icon: Camera,
    title: 'AI-Powered Photo Analysis',
    description: 'Simply snap a photo of your meal and get instant nutritional breakdowns with calorie, protein, carb, and fat estimates.',
  },
  {
    icon: Brain,
    title: 'Smart Meal Suggestions',
    description: 'Get personalized meal recommendations based on your remaining daily macros and dietary goals.',
  },
  {
    icon: Target,
    title: 'Personalized Goals',
    description: 'Set your dietary objectives - whether losing weight, gaining muscle, or maintaining - and track progress effortlessly.',
  },
  {
    icon: Zap,
    title: 'Voice Context',
    description: 'Add voice notes to refine analysis accuracy - mention cooking methods, portion sizes, or ingredients.',
  },
]

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Fitness Enthusiast',
    content: 'Finally, a nutrition app that actually saves me time! No more tedious manual logging - just snap and go.',
    rating: 5,
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Busy Professional',
    content: 'The AI analysis is surprisingly accurate. It has completely changed how I track my macros.',
    rating: 5,
  },
  {
    name: 'Dr. Emily Watson',
    role: 'Nutritionist',
    content: 'I recommend this to clients who struggle with traditional food tracking. The simplicity is game-changing.',
    rating: 5,
  },
]

const benefits = [
  'Effortless meal tracking in seconds',
  'Accurate AI-powered nutritional analysis',
  'Personalized recommendations',
  'Voice-enhanced accuracy',
  'Progress tracking dashboard',
  'Smart goal setting',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Nutrition Tracking,
            <br />
            <span className="text-foreground">Simplified</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Stop manually logging every meal. Just snap a photo and let AI do the heavy lifting. 
            Get instant nutritional insights and personalized recommendations to reach your health goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <SignUpButton>
              <Button size="lg" className="text-lg px-8 py-6 animate-pulse-scale">
                Get Started Free
              </Button>
            </SignUpButton>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Problem Statement */}
        <div className="text-center mb-20 animate-fade-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Tired of <span className="text-destructive">Manual Food Logging?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Traditional nutrition apps require tedious manual entry, complex portion calculations, 
            and constant guesswork. Most people give up within weeks because it&apos;s simply too much work.
          </p>
          <div className="bg-card border rounded-xl p-8 max-w-2xl mx-auto">
            <p className="text-2xl font-semibold text-primary mb-4">
              With Nutrition AI, tracking becomes as simple as taking a photo.
            </p>
            <p className="text-muted-foreground">
              Our advanced AI analyzes your meals instantly, providing accurate nutritional data 
              without the hassle of manual input.
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-12">
            Powerful Features, Simple Experience
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card border rounded-xl p-6 hover:shadow-lg transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-20 bg-card border rounded-2xl p-8 md:p-12">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Choose Nutrition AI?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-3 animate-fade-left"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-lg">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-12">
            What Our Users Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-card border rounded-xl p-6 hover:shadow-lg transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-primary/10 to-primary/5 border rounded-2xl p-12 animate-fade-in">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Nutrition Journey?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who have simplified their nutrition tracking. 
            Start your free journey today - no credit card required.
          </p>
          <SignUpButton>
            <Button size="lg" className="text-lg px-12 py-6 animate-pulse-scale">
              Start Tracking Smarter
            </Button>
          </SignUpButton>
        </div>
      </div>
    </div>
  )
}