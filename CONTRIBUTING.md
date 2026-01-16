# Contributing to Speed Reader

Thank you for your interest in contributing to Speed Reader! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/reader.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Follow the setup instructions in [SETUP.md](SETUP.md)

## Development Workflow

1. Make your changes
2. Test your changes thoroughly
3. Commit with clear, descriptive messages
4. Push to your fork
5. Create a Pull Request

## Code Style

### TypeScript
- Use TypeScript strict mode
- Avoid `any` types when possible
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### React
- Use functional components with hooks
- Keep components small and focused
- Use proper prop typing
- Follow React best practices

### Backend
- Use async/await for asynchronous code
- Handle errors properly
- Add input validation
- Write secure code (SQL injection, XSS prevention, etc.)

## Testing

Before submitting a PR:
- Test all new features
- Verify existing features still work
- Test edge cases
- Check for TypeScript errors: `npm run build`

## Commit Messages

Format: `type(scope): description`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat(reader): add bookmark functionality
fix(auth): resolve login token expiration issue
docs(readme): update installation instructions
```

## Pull Request Process

1. Update documentation if needed
2. Add/update tests for new features
3. Ensure all tests pass
4. Update README.md if you changed functionality
5. Request review from maintainers

## Areas for Contribution

- **Features**: Implement items from the roadmap
- **Bug Fixes**: Fix reported issues
- **Documentation**: Improve docs, add examples
- **Testing**: Add unit/integration tests
- **Performance**: Optimize slow operations
- **UI/UX**: Improve user interface and experience

## Feature Requests

Have an idea? Open an issue with:
- Clear description of the feature
- Use case and benefits
- Possible implementation approach

## Bug Reports

Found a bug? Open an issue with:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, browser, etc.)
- Screenshots if applicable

## Questions?

Feel free to open a discussion or issue if you have questions about contributing!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
