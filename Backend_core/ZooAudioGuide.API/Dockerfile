# Stage 1: Build code
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy file csproj và restore các thư viện (NuGet)
COPY ["ZooAudioGuide.API.csproj", "./"]
RUN dotnet restore "./ZooAudioGuide.API.csproj"

# Copy toàn bộ code và build ra thư mục /publish
COPY . .
RUN dotnet publish "ZooAudioGuide.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Chạy ứng dụng
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/publish .

# Khởi chạy ứng dụng C#
ENTRYPOINT ["dotnet", "ZooAudioGuide.API.dll"]