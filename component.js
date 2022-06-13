import React, { useState } from "react"
import getty from "gettyimages-api"
import { apiKey, apiSecret } from "config:asset-source-getty"
import {Dialog, Flex, Select, Card, Inline, TextInput, Button, Stack, Grid, Text} from "@sanity/ui"

const gettyClient = new getty({ apiKey, apiSecret });

const getImages = async (type, query = '', page = 1) => {
    let request = gettyClient;

    if (type === 'editorial') request = request.searchimageseditorial();
    if (type === 'creative') request = request.searchimagescreative();
    if (query) request = request.withPhrase(query)

    const { images } = await request.withPage(page).withPageSize(24).execute();
    return images;
}

function Component(props) {
    let [type, setType] = useState('editorial')
    let [query, setQuery] = useState('')
    let [page, setPage] = useState(1)
    let [images, setImages] = useState([])
    getImages(type, query, page).then(returned => {
        setImages(() => returned)
    })

    const handleSelect = (image) => {
        props.onSelect([
            {
                kind: "url",
                value: image.display_sizes[0].uri,
                assetDocumentProps: {
                    originalFilename: `getty-${image.id}.jpg`,
                    source: {
                        source: "getty",
                        id: image.id,
                        url: image.display_sizes[0].uri,
                    },
                    description: image.caption,
                    creditLine: image.caption,
                },
            },
        ])
    }

    return (
        <Dialog
            id="getty-images"
            header="Getty Images"
            onClose={props.onClose}
            open
            width={2}
        >
            <Stack padding={4} space={4}>
                <form>
                    <Flex space={3}>
                        <Stack flex={[2, 4, 6, 8]} padding={1}>
                            <TextInput
                                fontSize={2}
                                padding={3}
                                placeholder="Search for images..."
                                onChange={(event) => setQuery(event.currentTarget.value)}
                            />
                        </Stack>
                        <Stack flex={2} padding={1}>
                            <Select
                                fontSize={2}
                                padding={3}
                                space={2}
                                name="type"
                                onChange={(event) => setType(event.currentTarget.value)}
                            >
                                <option value="editorial">Editorial</option>
                                <option value="creative">Creative</option>
                            </Select>
                        </Stack>
                    </Flex>
                </form>
                <Grid columns={2} gap={1}>
                    {images.map((image) => (
                        <Card
                            padding={4}
                            radius={2}
                            shadow={1}
                            tone="default"
                            onClick={() => handleSelect(image)}
                        >
                            <img style={{width:'100%',maxHeight:'200px',objectFit:'contain',objectPosition:'center',margin:'0 auto',display:'block'}} src={image.display_sizes[0].uri} />
                            <br/>
                            <Text align="center" size={1} weight="semibold">{image.title}</Text>
                        </Card>
                    ))}
                </Grid>
                <Card padding={2} style={{textAlign: 'center'}}>
                    <Inline space={3}>
                        <Button
                            fontSize={2}
                            mode="ghost"
                            padding={3}
                            text="Previous"
                            disabled={page === 1}
                            onClick={() => setPage(page => page - 1)}
                        />
                        <Button
                            fontSize={2}
                            mode="ghost"
                            padding={3}
                            text="Next"
                            onClick={() => setPage(page => page + 1)}
                        />
                    </Inline>
                </Card>
            </Stack>
        </Dialog>
    )
}

export default Component