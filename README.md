# 🌱 **Mood Gardens**
### *An AI-generated visual diary with encryption, aggregation, and emotional landscape generation*

Mood Gardens transforms personal diary entries into **AI-generated emotional gardens**.  
It combines **React + TypeScript**, **Node/Express + GraphQL**, **Prisma + Postgres**, **Redis + BullMQ workers**, **AES-GCM encryption**, and **OpenAI image generation**.

This repository is designed as a **portfolio flagship project**, showcasing full-stack engineering, distributed systems, security, and cloud DevOps.

---

## 🌟 Features

### 🧠 AI Mood Analysis
- Semantic mood extraction from diary entries  
- Weighted emotion scoring  
- Dynamic prompt generation for OpenAI image models  

### 🌺 Generative Mood Gardens
- AI-generated images based on emotional signatures  
- Custom ambience layers, palettes, and generative rules  
- Daily / weekly / monthly / yearly gardens  

### 🔐 Zero-Trust Encryption Model
- AES-GCM encryption for all diary entries  
- Per-user Data Encryption Keys (DEKs)  
- Keys encrypted via Azure Key Vault  
- No plaintext diary content stored anywhere  

### 🗓 Time-Period Aggregation Engine
- Daily → Weekly → Monthly → Yearly summaries  
- BullMQ workers for background processing  
- Retries, idempotency, and progress reporting  
- Timezone-aware with custom “day rollover” per user  

### 👤 Elegant Frontend
- React + Vite + TypeScript + Tailwind CSS  
- Apollo Client for GraphQL  
- Live job progress for garden generation  
- Secure login & Google OAuth  
- Mobile-friendly UI  
- Hosted on Vercel (mymoodgardens.com)

### Strong Backend
- Node.js + Express + Apollo GraphQL  
- Prisma ORM  
- PostgreSQL (Azure)  
- Redis queue engine  
- Cloudinary for image uploads  
- Hosted on Azure Container Apps

---

## Architecture Overview

User writes diary entry
|
v
Diary entry encrypted (AES-GCM)
|
v
Saved to DB (encrypted) ----> Garden record created (PENDING)
|
v
Garden job queued (BullMQ)
|
v
Garden Worker processes job:
1. Fetch garden + decrypt diary
2. Analyse emotions + generate prompt
3. Request image from OpenAI
4. Upload image to Cloudinary
5. Save final summary + metadata
|
v
Garden marked READY → User sees result

Cloudinary (Image Storage)
Azure Key Vault (Encrypted User Keys)


## MoodGardens – Image Generation Pipeline (Overview)

The MoodGardens Image Generation Pipeline transforms encrypted diary entries into AI-generated emotional gardens using a secure, multi-stage processing workflow.
The system is designed for privacy, scalability, and asynchronous processing, powered by BullMQ, Redis, Prisma, OpenAI, and Cloudinary

### High Level Architecture

```mermaid
sequenceDiagram
    autonumber

    participant U as User
    participant API as Backend API
    participant DB as Database
    participant Q as BullMQ Queue
    participant W as Garden Worker
    participant OA as OpenAI
    participant CL as Cloudinary

    U->>API: Write & submit diary entry
    API->>API: Encrypt diary (AES-GCM)
    API->>DB: Save encrypted diary
    API->>DB: Create Garden (PENDING)
    API->>Q: Enqueue garden job (gardenId)

    Q->>W: Deliver job (gardenId)
    W->>DB: Fetch garden + encrypted diary
    W->>W: Decrypt diary
    W->>W: Analyse emotions & build prompt
    W->>OA: Request image with prompt
    OA-->>W: Return generated image
    W->>CL: Upload image
    CL-->>W: Return image URL
    W->>DB: Save image URL, summary, metadata\nstatus = READY

    U->>API: Check garden status
    API->>DB: Load garden
    DB-->>API: Garden (READY + image URL)
    API-->>U: Display finished garden


---

## Security Highlights

- AES-GCM encryption (256-bit)  
- Unique encrypted DEK per user  
- Diary text *never* exists unencrypted in the DB  
- Secure cookies (`SameSite=None`, `Secure`, domain-scoped)  
- Sanitized public share pages  
- Strict GraphQL validation  

---

##  Deployment & DevOps

- Docker multi-stage builds  
- GitHub Actions CI/CD  
- Push → Build → Push to Docker Hub → Deploy to Azure  
- Independent scaling for API vs workers  
- Vercel hosting for the frontend  
- Environment secrets stored in Azure Key Vault + Vercel  

---

## 📂 Tech Stack

**Frontend:**  
React, Vite, TypeScript, Tailwind, Apollo Client  

**Backend:**  
Node.js, Express, GraphQL, Prisma, PostgreSQL  

**AI:**  
OpenAI API (image + text), custom prompt engine  

**Workers:**  
Redis, BullMQ, multi-container worker system  

**Cloud:**  
Azure Container Apps, Azure Redis, Azure Postgres, Azure Key Vault  

**Storage:**  
Cloudinary (image hosting), PostgreSQL (structured data)  

**DevOps:**  
Docker, Docker Hub, GitHub Actions  

---

## 🎨 Example Output

<img width="150" height="150" alt="Birds" src="https://github.com/user-attachments/assets/121e2897-f0b3-4874-91ff-ebaf7e4c8df1" />
<img width="150" height="150" alt="Whirl" src="https://github.com/user-attachments/assets/b0033e2b-3345-4b5b-9b37-ab3ef87d95ed" />
<img width="150" height="150" alt="Trippy" src="https://github.com/user-attachments/assets/cd52dc88-af20-4d47-92fa-7d161bfa7807" />
<img width="150" height="150" alt="Castle" src="https://github.com/user-attachments/assets/3818e9c1-0fab-4434-a71b-5ffee9366e42" />
<img width="150" height="150" alt="Love" src="https://github.com/user-attachments/assets/34695a06-297d-4807-bb3a-39e8f0540b49" />
<img width="150" height="150" alt="Frogs" src="https://github.com/user-attachments/assets/e84046ff-00ec-4520-9af9-c18c4d533a36" />
<img width="150" height="150" alt="Moon" src="https://github.com/user-attachments/assets/4b396ed0-981d-4ff4-b9fd-63a8917407ff" />
<img width="150" height="150" alt="Starry" src="https://github.com/user-attachments/assets/1a46f16d-3eb2-491e-81aa-a6576b3fbfe2" />
<img width="150" height="150" alt="Pool" src="https://github.com/user-attachments/assets/157c81dc-3440-42f5-859d-d48205b7af04" />
<img width="150" height="150" alt="Lavender" src="https://github.com/user-attachments/assets/eb9b24a3-188e-4371-bef6-0abddcc207d7" />
<img width="150" height="150" alt="Darkness" src="https://github.com/user-attachments/assets/77710195-24e4-4e93-8d09-2ceb7370d966" />
<img width="150" height="150" alt="Thunder" src="https://github.com/user-attachments/assets/5506a812-2066-434a-815e-3192b25b1983" />


---

## 👤 About the Developer

Hi — I’m **Alex Crabbe**, a full-stack developer with a background in **Biomedical Physics (MRI simulations)**.

Mood Gardens demonstrates:

- End-to-end encryption  
- Distributed background processing  
- AI image generation pipelines  
- Cloud-native deployment  
- Complex frontend + backend integration  
- Secure authentication and cookie flows  

**Portfolio:** https://www.alex-crabbe.vercel.app  
**Project:** https://www.mymoodgardens.com  

---

## 📩 Contact

**Email:** alexrobincrabbe@gmail.com  
**LinkedIn:** https://www.linkedin.com/in/alex-crabbe









