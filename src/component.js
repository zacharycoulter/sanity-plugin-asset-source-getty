import React, { useState, useEffect } from "react";
import getty from "gettyimages-api";
import { apiKey, apiSecret } from "config:asset-source-getty";
import hooks from "part:sanity-plugin-asset-source-getty/hooks?";
import {Dialog, Flex, Select, Card, Inline, TextInput, Button, Stack, Heading, Text} from "@sanity/ui";

const gettyClient = new getty({ apiKey, apiSecret });

const getImages = async (type, query = '', page = 1, sort = 'newest') => {
    let request = gettyClient;

    if (type === 'editorial') request = request.searchimageseditorial();
    if (type === 'creative') request = request.searchimagescreative();
    if (query) request = request.withPhrase(query)

    const { images } = await request.withPage(page).withPageSize(24).withSortOrder(sort).execute();
    console.log(images)
    return images;
}

function Component(props) {
    let [type, setType] = useState('editorial');
    let [sort, setSort] = useState('newest');
    let [query, setQuery] = useState('');
    let [page, setPage] = useState(1);
    let [images, setImages] = useState([]);

    useEffect(() => {
        getImages(type, query, page, sort).then(returned => setImages(() => returned))
    }, [])
    const onSearch = () => getImages(type, query, page, sort).then(returned => setImages(() => returned))
    const onPageChange = (direction) => {
        setPage(() => page + direction)
        getImages(type, query, page, sort).then(returned => setImages(() => returned))
    }

    const handleSelect = (image) => {
        props.onSelect([
            {
                kind: "url",
                value: image.display_sizes.at(-1).uri,
                assetDocumentProps: {
                    originalFilename: `getty-${image.id}.jpg`,
                    source: {
                        source: "getty",
                        id: image.id,
                        url: image.display_sizes.at(-1).uri,
                    },
                    description: image.caption,
                    creditLine: image.caption,
                },
            },
        ]);

        if (hooks && Object.keys(hooks).includes('onSelect'))
            hooks.onSelect(image);
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
                                onChange={(event) => setSort(event.currentTarget.value)}
                            >
                                <option value="newest">Newest</option>
                                <option value="oldest">Oldest</option>
                                <option value="most_popular">Most Popular</option>
                                <option value="best">Best</option>=
                            </Select>
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
                        <Stack flex={2} padding={1}>
                            <Button
                                fontSize={2}
                                mode="ghost"
                                padding={3}
                                text="Search"
                                onClick={() => onSearch()} />
                        </Stack>
                    </Flex>
                </form>
                <Stack>
                    {images.map((image) => (
                        <Flex space={3} style={{marginBottom:'30px',cursor:'pointer'}} onClick={() => handleSelect(image)}>
                            <Stack flex={2} padding={1}>
                                <img
                                    style={{
                                        display:'block',
                                        width:'100%',
                                        maxHeight:'220px',
                                        margin:'0 auto',
                                        objectFit: 'contain',
                                        objectPosition: 'center',
                                    }}
                                    src={image.display_sizes[0].uri}
                                />
                            </Stack>
                            <Stack flex={3} padding={1}>
                                <Heading style={{marginBottom: '15px'}}>{image.title}</Heading>
                                <Text size={1}>{image.caption}</Text>
                            </Stack>
                        </Flex>
                    ))}
                </Stack>
                <Card padding={2} style={{textAlign: 'center'}}>
                    <Inline space={3}>
                        <Button
                            fontSize={2}
                            mode="ghost"
                            padding={3}
                            text="Previous"
                            disabled={page === 1}
                            onClick={() => onPageChange(-1)}
                        />
                        <Button
                            fontSize={2}
                            mode="ghost"
                            padding={3}
                            text="Next"
                            onClick={() => onPageChange(1)}
                        />
                    </Inline>
                </Card>
            </Stack>
        </Dialog>
    )
}

export default Component