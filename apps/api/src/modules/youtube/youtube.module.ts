import { Module } from '@nestjs/common'
// import { HttpModule } from '@nestjs/axios'

import { YouTubeService } from './youtube.service'

@Module({
  imports: [
    // HttpModule.register({
    //   timeout: 2500,
    //   maxRedirects: 2,
    // }),
  ],
  providers: [YouTubeService],
  controllers: [],
})
export class YouTubeModule {}
