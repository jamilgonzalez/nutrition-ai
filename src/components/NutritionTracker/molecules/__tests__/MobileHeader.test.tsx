import { render, screen } from '@testing-library/react'
import MobileHeader from '../MobileHeader'
import { describe, it, expect } from 'vitest'

/**
 * MobileHeader Component Tests
 * 
 * This component displays the mobile app header with branding.
 * Features a logo, app name, and sticky positioning.
 */
describe('MobileHeader', () => {
  describe('Basic Functionality', () => {
    it('renders app name correctly', () => {
      render(<MobileHeader />)

      expect(screen.getByText('Nutrition AI')).toBeInTheDocument()
    })

    it('renders logo with correct text', () => {
      render(<MobileHeader />)

      expect(screen.getByText('N')).toBeInTheDocument()
    })

    it('displays logo and name together', () => {
      render(<MobileHeader />)

      const logo = screen.getByText('N')
      const name = screen.getByText('Nutrition AI')

      expect(logo).toBeInTheDocument()
      expect(name).toBeInTheDocument()
    })
  })

  describe('Layout and Styling', () => {
    it('applies correct container styling', () => {
      const { container } = render(<MobileHeader />)

      const mainContainer = container.firstChild
      expect(mainContainer).toHaveClass(
        'sticky', 'top-0', 'z-10', 'bg-white/95', 
        'backdrop-blur-sm', 'border-slate-200'
      )
    })

    it('applies correct inner container styling', () => {
      render(<MobileHeader />)

      // Find the container with p-4 class
      const innerContainer = screen.getByText('Nutrition AI').closest('div[class*="p-4"]')
      expect(innerContainer).toHaveClass('flex', 'items-center', 'justify-between', 'p-4')
    })

    it('applies correct logo styling', () => {
      render(<MobileHeader />)

      const logo = screen.getByText('N')
      const logoContainer = logo.parentElement

      expect(logoContainer).toHaveClass(
        'w-8', 'h-8', 'bg-black', 'rounded-full', 
        'flex', 'items-center', 'justify-center'
      )
      expect(logo).toHaveClass('text-white', 'font-bold', 'text-sm')
    })

    it('applies correct app name styling', () => {
      render(<MobileHeader />)

      const appName = screen.getByText('Nutrition AI')
      expect(appName.tagName).toBe('H1')
      expect(appName).toHaveClass('text-lg', 'font-semibold', 'text-slate-800')
    })
  })

  describe('Logo Design', () => {
    it('creates circular logo container', () => {
      render(<MobileHeader />)

      const logoContainer = screen.getByText('N').parentElement
      expect(logoContainer).toHaveClass('rounded-full')
    })

    it('uses correct logo dimensions', () => {
      render(<MobileHeader />)

      const logoContainer = screen.getByText('N').parentElement
      expect(logoContainer).toHaveClass('w-8', 'h-8')
    })

    it('centers logo text properly', () => {
      render(<MobileHeader />)

      const logoContainer = screen.getByText('N').parentElement
      expect(logoContainer).toHaveClass('flex', 'items-center', 'justify-center')
    })

    it('uses high contrast colors for logo', () => {
      render(<MobileHeader />)

      const logoContainer = screen.getByText('N').parentElement
      const logoText = screen.getByText('N')

      expect(logoContainer).toHaveClass('bg-black')
      expect(logoText).toHaveClass('text-white')
    })
  })

  describe('Accessibility', () => {
    it('uses proper heading hierarchy', () => {
      render(<MobileHeader />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent('Nutrition AI')
    })

    it('provides meaningful logo text', () => {
      render(<MobileHeader />)

      const logoText = screen.getByText('N')
      expect(logoText).toBeInTheDocument()
    })

    it('maintains logical content order', () => {
      render(<MobileHeader />)

      const logo = screen.getByText('N')
      const title = screen.getByText('Nutrition AI')

      // Logo should come before title in DOM order
      expect(logo.compareDocumentPosition(title)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    })
  })

  describe('Responsive Design', () => {
    it('maintains sticky positioning', () => {
      const { container } = render(<MobileHeader />)

      const header = container.firstChild
      expect(header).toHaveClass('sticky', 'top-0')
    })

    it('applies backdrop blur for visual separation', () => {
      const { container } = render(<MobileHeader />)

      const header = container.firstChild
      expect(header).toHaveClass('bg-white/95', 'backdrop-blur-sm')
    })

    it('maintains proper z-index for layering', () => {
      const { container } = render(<MobileHeader />)

      const header = container.firstChild
      expect(header).toHaveClass('z-10')
    })
  })

  describe('Brand Consistency', () => {
    it('displays consistent app name', () => {
      render(<MobileHeader />)

      expect(screen.getByText('Nutrition AI')).toBeInTheDocument()
      expect(screen.queryByText('Nutrition App')).not.toBeInTheDocument()
      expect(screen.queryByText('NutritionAI')).not.toBeInTheDocument()
    })

    it('uses consistent logo letter', () => {
      render(<MobileHeader />)

      expect(screen.getByText('N')).toBeInTheDocument()
      expect(screen.queryByText('NA')).not.toBeInTheDocument()
      expect(screen.queryByText('n')).not.toBeInTheDocument()
    })
  })

  describe('Visual Hierarchy', () => {
    it('makes app name prominent', () => {
      render(<MobileHeader />)

      const appName = screen.getByText('Nutrition AI')
      expect(appName).toHaveClass('text-lg', 'font-semibold')
    })

    it('groups logo and name appropriately', () => {
      render(<MobileHeader />)

      const logo = screen.getByText('N')
      const name = screen.getByText('Nutrition AI')
      
      // Both should be visible and in the same general container
      expect(logo).toBeInTheDocument()
      expect(name).toBeInTheDocument()
      
      // Check they are both in a flex container with gap-2
      const logoContainer = logo.closest('div')?.parentElement
      expect(logoContainer).toHaveClass('flex', 'items-center', 'gap-2')
    })
  })

  describe('Layout Structure', () => {
    it('uses flexbox for proper alignment', () => {
      render(<MobileHeader />)

      const brandContainer = screen.getByText('N').closest('.flex')
      expect(brandContainer).toHaveClass('flex', 'items-center')
    })

    it('applies consistent padding', () => {
      render(<MobileHeader />)

      const innerContainer = screen.getByText('N').closest('div[class*="p-4"]')
      expect(innerContainer).toHaveClass('p-4')
    })
  })

  describe('Component Stability', () => {
    it('renders consistently across multiple renders', () => {
      const { rerender } = render(<MobileHeader />)

      expect(screen.getByText('Nutrition AI')).toBeInTheDocument()
      expect(screen.getByText('N')).toBeInTheDocument()

      rerender(<MobileHeader />)

      expect(screen.getByText('Nutrition AI')).toBeInTheDocument()
      expect(screen.getByText('N')).toBeInTheDocument()
    })

    it('maintains styling integrity', () => {
      render(<MobileHeader />)

      const logo = screen.getByText('N')
      const title = screen.getByText('Nutrition AI')

      expect(logo).toHaveClass('text-white', 'font-bold', 'text-sm')
      expect(title).toHaveClass('text-lg', 'font-semibold', 'text-slate-800')
    })
  })

  describe('Performance Considerations', () => {
    it('uses efficient styling classes', () => {
      const { container } = render(<MobileHeader />)

      const header = container.firstChild
      expect(header).toHaveClass('sticky', 'top-0', 'z-10')
    })

    it('optimizes for mobile viewport', () => {
      render(<MobileHeader />)

      const logo = screen.getByText('N').parentElement
      expect(logo).toHaveClass('w-8', 'h-8') // Appropriate size for mobile
    })
  })
})