# 🎯 Navai Analytics Backend

Professional NestJS + PostgreSQL + Prisma backend for AI-powered call analytics system.

## ⚡ Tezkor Ishga Tushirish

### Windows:
```bash
fix-errors.bat
npm run start:dev
```

### Linux/Mac:
```bash
chmod +x fix-errors.sh
./fix-errors.sh
npm run start:dev
```

### Yoki qo'lda:
```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run start:dev
```

## 🌐 API

- **Server**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs
- **Prisma Studio**: `npm run prisma:studio`


## 📚 Hujjatlar

- **Tezkor Boshlash**: `QUICK_START.md`
- **To'liq Sozlash**: `SETUP.md`
- **API Endpoints**: `API_ENDPOINTS.md`
- **Loyiha Xulosasi**: `PROJECT_SUMMARY.md`

## ✨ Xususiyatlar

- ✅ JWT Authentication
- ✅ Role-based Access Control
- ✅ User Management
- ✅ Branch & Department Management
- ✅ Call Processing Pipeline
- ✅ AI Integration (STT + LLM)
- ✅ Dashboard Analytics
- ✅ Report Generation
- ✅ Settings Management
- ✅ Swagger Documentation
- ✅ Docker Support
- ✅ Database Seeding

## 🛠️ Texnologiyalar

- NestJS v11
- PostgreSQL v15
- Prisma ORM v6
- TypeScript v5
- JWT Authentication
- Swagger/OpenAPI
- Docker & Docker Compose

## 📊 Loyiha Strukturasi

```
src/
├── ai/          # AI processing (STT + LLM)
├── auth/        # Authentication & JWT
├── branch/      # Branch management
├── call/        # Call management
├── criteria/    # Evaluation criteria
├── dashboard/   # Analytics & statistics
├── department/  # Department management
├── prisma/      # Database service
├── prompt/      # AI prompts
├── report/      # Report generation
├── settings/    # System settings
├── sip/         # Sip.uz integration + CRON
├── topic/       # Topics management
└── user/        # User management
```

## Description

Navai Analytics - Professional call analytics backend with AI integration.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
