import { Box, Image, Text, VStack, Badge, HStack } from '@chakra-ui/react'
import Link from 'next/link'

interface Anime {
  mal_id: number
  title: string
  image_url: string
  score: number
  episodes: number
  status: string
}

interface AnimeCardProps {
  anime: Anime
}

export default function AnimeCard({ anime }: AnimeCardProps) {
  return (
    <Link href={`/anime/${anime.mal_id}`} passHref>
      <Box
        as="a"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        transition="all 0.2s"
        _hover={{
          transform: 'translateY(-4px)',
          shadow: 'lg',
        }}
      >
        <Image
          src={anime.image_url}
          alt={anime.title}
          height="300px"
          width="100%"
          objectFit="cover"
        />
        <VStack p={4} align="stretch" spacing={2}>
          <Text fontWeight="bold" fontSize="lg" noOfLines={2}>
            {anime.title}
          </Text>
          <HStack spacing={2}>
            <Badge colorScheme="green">{anime.score.toFixed(1)}</Badge>
            <Badge colorScheme="blue">{anime.episodes} эп.</Badge>
            <Badge colorScheme="purple">{anime.status}</Badge>
          </HStack>
        </VStack>
      </Box>
    </Link>
  )
} 