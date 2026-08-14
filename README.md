# Frontend Capstone

This repository contains my frontend capstone project demonstrating AI-assisted development practices with modern frontend technologies.

## Project Overview

A responsive frontend application showcasing modern HTML/CSS/JavaScript techniques, built with AI-assisted development practices. Demonstrates semantic HTML, organized CSS architecture, and vanilla JavaScript patterns suitable for portfolio demonstration.

## Tech Stack

- HTML
- CSS
- JavaScript
- Node.js

## Goals

- Learn AI-assisted development
- Practice Git and GitHub
- Build frontend applications

## Getting Started

1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/frontend-capstone.git
cd frontend-capstone
```
## AI Lead Scoring Tool

This project includes a server-side `scoreLead` tool powered by the AI SDK and validated with Zod.

### Tool Contract

**Name:** `scoreLead`

**Purpose:** Scores a sales lead based on company size, budget, and engagement.

### Input Schema

```text
companySize: number
budget: number
engagement: "low" | "medium" | "high"