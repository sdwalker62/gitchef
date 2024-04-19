-- CreateTable
CREATE TABLE "employees" (
    "id" INTEGER NOT NULL,
    "first_name" VARCHAR(50),
    "last_name" VARCHAR(50),
    "email" VARCHAR(100),
    "hire_date" DATE,
    "job_title" VARCHAR(50),
    "department" VARCHAR(50),
    "salary" DECIMAL(10,2),

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");

