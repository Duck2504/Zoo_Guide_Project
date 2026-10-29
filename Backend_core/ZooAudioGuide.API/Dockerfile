# Stage 1: Build code
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy file csproj và restore các thư viện (NuGet)
COPY ["ZooAudioGuide.csproj", "./"]
RUN dotnet restore "./ZooAudioGuide.csproj"

# Copy toàn bộ code và build ra thư mục /publish
COPY . .
RUN dotnet publish "ZooAudioGuide.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Chạy ứng dụng
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

# Khởi chạy ứng dụng C#
ENTRYPOINT ["dotnet", "ZooAudioGuide.dll"]