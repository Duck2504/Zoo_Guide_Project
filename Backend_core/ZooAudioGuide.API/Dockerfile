# Stage 1: Build code
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy file csproj và restore các thư viện (NuGet)
COPY ["Program.csproj", "./"]
RUN dotnet restore "./Program.csproj"

# Copy toàn bộ code và build ra thư mục /publish
COPY . .
RUN dotnet publish "Program.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Chạy ứng dụng
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

# Khởi chạy ứng dụng C#
ENTRYPOINT ["dotnet", "Program.dll"]