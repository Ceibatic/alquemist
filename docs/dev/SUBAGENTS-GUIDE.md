# Claude Code Sub-Agents Guide

This guide explains the specialized AI sub-agents configured for the Alquemist project. Sub-agents are domain experts that help with specific development tasks efficiently.

## What are Sub-Agents?

Sub-agents are specialized AI assistants with:
- **Dedicated context windows** - Keep the main conversation focused
- **Specific expertise** - Deep knowledge in particular domains
- **Controlled tool access** - Only the tools they need
- **Custom instructions** - Tailored prompts for their specialty

## Available Sub-Agents

### 1. Frontend Developer (`frontend-dev`)

**Specialty**: React, Next.js, and UI development

**Best for**:
- Creating new React components
- Building forms with React Hook Form + Zod
- Implementing UI with Radix UI and Tailwind CSS
- Working with Next.js App Router (Server/Client Components)
- Responsive design and accessibility

**Example usage**:
```
Create a user profile form with email, name, and bio fields.
Use React Hook Form with Zod validation.
```

**Tech stack expertise**:
- Next.js 15 with App Router
- React 19
- Tailwind CSS
- Radix UI components
- React Hook Form + Zod
- Lucide React icons

### 2. Backend Developer (`backend-dev`)

**Specialty**: Convex serverless backend

**Best for**:
- Creating Convex queries, mutations, and actions
- Designing database schemas
- Writing HTTP endpoints
- Implementing email workflows with Resend
- Database optimization and indexing

**Example usage**:
```
Create a Convex mutation to register a new user with email verification.
Include proper validation and error handling.
```

**Tech stack expertise**:
- Convex serverless platform
- Database schema design
- Zod validation
- Resend email integration
- Authentication patterns

### 3. Code Reviewer (`code-reviewer`)

**Specialty**: Quality assurance and security

**Best for**:
- Reviewing pull requests
- Security audits
- Code quality checks
- Best practices enforcement
- Identifying bugs and vulnerabilities

**Example usage**:
```
Review my recent changes for security issues and code quality.
```

**Focus areas**:
- Security (XSS, injection, secrets)
- Code quality and readability
- TypeScript best practices
- React/Next.js patterns
- Convex optimization
- Accessibility

### 4. TypeScript Expert (`typescript-expert`)

**Specialty**: Type safety and advanced TypeScript

**Best for**:
- Fixing type errors
- Designing type-safe APIs
- Creating complex types and generics
- Zod schema design
- Type inference optimization

**Example usage**:
```
Help me create type-safe repository pattern with generics
for my Convex queries and mutations.
```

**Expertise**:
- Advanced TypeScript patterns
- Generics and utility types
- Type narrowing and guards
- Zod schema integration
- Discriminated unions

### 5. Test Engineer (`test-engineer`)

**Specialty**: Testing and quality assurance

**Best for**:
- Writing unit tests for components
- Testing Convex functions
- Integration test design
- Test coverage analysis
- Setting up testing infrastructure

**Example usage**:
```
Write comprehensive tests for the user registration flow,
including form validation and Convex mutations.
```

**Testing approach**:
- Jest + React Testing Library
- Convex test helpers
- User-centric testing
- Comprehensive coverage
- Integration testing

## How to Use Sub-Agents

### Automatic Invocation

Claude will automatically use sub-agents when appropriate:

```
User: "Create a login form"
→ Claude invokes frontend-dev automatically
```

### Explicit Invocation

You can request specific sub-agents:

```
User: "Use the typescript-expert to fix these type errors"
User: "Ask the code-reviewer to audit this PR"
User: "Have the backend-dev create a new Convex schema"
```

### Chaining Sub-Agents

You can chain multiple sub-agents:

```
User: "First use backend-dev to create the API, then use
frontend-dev to build the UI, and finally use test-engineer
to write tests"
```

## Sub-Agent Workflow Examples

### Example 1: New Feature Development

**Task**: Add user profile editing functionality

**Workflow**:
1. **Backend-dev**: Create Convex mutation for updating profiles
2. **Frontend-dev**: Build the profile edit form component
3. **TypeScript-expert**: Ensure type safety across the stack
4. **Test-engineer**: Write tests for the feature
5. **Code-reviewer**: Review the complete implementation

**Command**:
```
I need to add profile editing. Use backend-dev for the API,
frontend-dev for the UI, typescript-expert for types,
test-engineer for tests, and code-reviewer for final review.
```

### Example 2: Bug Fix

**Task**: Fix authentication bug

**Workflow**:
1. **Code-reviewer**: Analyze the issue
2. **Backend-dev** or **Frontend-dev**: Fix the bug
3. **Test-engineer**: Add regression tests
4. **Code-reviewer**: Verify the fix

### Example 3: Code Review

**Task**: Review before merging PR

**Workflow**:
```
Use code-reviewer to review my latest changes on the
registration-flow branch.
```

The code-reviewer will automatically:
- Check `git diff`
- Review all changed files
- Provide categorized feedback
- Flag security issues

## Best Practices

### 1. Choose the Right Sub-Agent

- **Development tasks** → frontend-dev or backend-dev
- **Type problems** → typescript-expert
- **Quality/security** → code-reviewer
- **Testing** → test-engineer

### 2. Be Specific

Good: "Use frontend-dev to create a mobile-responsive navigation menu with Radix UI"

Less good: "Make a menu"

### 3. Provide Context

Include relevant information:
- What you're trying to achieve
- Existing code or patterns to follow
- Specific requirements or constraints

### 4. Review Sub-Agent Work

Sub-agents are experts but not infallible:
- Review their suggestions
- Ask questions if unclear
- Request alternatives if needed

### 5. Combine Sub-Agents

For complex tasks, use multiple sub-agents:
- Backend-dev + Frontend-dev for full-stack features
- TypeScript-expert + Code-reviewer for refactoring
- Any dev + Test-engineer for test coverage

## Sub-Agent Limitations

**Sub-agents cannot**:
- Access your credentials or secrets
- Deploy to production
- Make destructive changes without confirmation
- Access external services directly

**Sub-agents can**:
- Read and modify code files
- Run read-only commands
- Suggest and implement changes
- Run tests and builds

## Customizing Sub-Agents

All sub-agents are stored in `.claude/agents/` directory:

```
.claude/
├── agents/
│   ├── frontend-dev.md
│   ├── backend-dev.md
│   ├── code-reviewer.md
│   ├── typescript-expert.md
│   └── test-engineer.md
└── settings.local.json
```

You can:
- Edit existing sub-agents to adjust their behavior
- Add new project-specific sub-agents
- Remove sub-agents you don't need

### Creating a Custom Sub-Agent

Create a new file in `.claude/agents/`:

```markdown
---
name: my-custom-agent
description: When to use this agent
tools: Read, Write, Edit, Bash
model: sonnet
---

You are a specialized agent for...

[Detailed instructions for the agent]
```

## Built-in Claude Code Sub-Agents

In addition to your custom sub-agents, Claude Code includes built-in sub-agents:

### General-Purpose
- Handles complex multi-step tasks
- Full tool access
- Uses Sonnet model

### Plan
- Conducts codebase research
- Read-only focus
- Uses Sonnet model

### Explore
- Fast codebase searches
- Strictly read-only
- Uses Haiku model (faster/cheaper)

## Tips for Maximum Effectiveness

1. **Start with the right sub-agent** - Saves time and context
2. **Provide examples** - Show sub-agents existing code patterns
3. **Iterate** - Refine requirements based on sub-agent output
4. **Chain intelligently** - Plan multi-step workflows
5. **Use code-reviewer proactively** - Catch issues early

## Troubleshooting

### Sub-agent not activating?

- Use explicit invocation: "Use [agent-name] to..."
- Check if the task matches the agent's description
- Verify the agent file exists in `.claude/agents/`

### Sub-agent making wrong assumptions?

- Provide more context in your request
- Reference specific files or patterns
- Correct and re-run with clarifications

### Sub-agent has outdated information?

- Update the sub-agent's markdown file
- Add project-specific guidelines
- Include links to documentation

## Additional Resources

- [Official Claude Code Sub-Agents Documentation](https://code.claude.com/docs/en/sub-agents)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Community Sub-Agents Repository](https://github.com/VoltAgent/awesome-claude-code-subagents)

## Feedback and Improvements

Found ways to improve our sub-agents? Suggestions:

1. Edit the agent files in `.claude/agents/`
2. Share improvements with the team
3. Document new patterns in this guide

---

**Last Updated**: December 2025
**Maintained by**: Alquemist Development Team
